const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const UPLOAD_PROFILES = {
  document: {
    extensions: new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]),
    mimeTypes: new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ]),
    maxSizeBytes: 5 * 1024 * 1024,
    label: "PDF, DOC, DOCX, JPG, PNG",
  },
  image: {
    extensions: new Set([".jpg", ".jpeg", ".png", ".webp"]),
    mimeTypes: new Set(["image/jpeg", "image/png", "image/webp"]),
    maxSizeBytes: 2 * 1024 * 1024,
    label: "JPG, PNG, WEBP",
  },
};

const sanitizeOriginalName = (name) => {
  const base = path.basename(String(name || "file"));
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return sanitized.slice(0, 100) || "file";
};

const getProfile = (profileName) => {
  const profile = UPLOAD_PROFILES[profileName];
  if (!profile) {
    throw new Error(`Unknown upload profile: ${profileName}`);
  }
  return profile;
};

const validateFileAgainstProfile = (file, profileName) => {
  const profile = getProfile(profileName);
  const ext = path.extname(file.originalname || "").toLowerCase();

  if (!profile.extensions.has(ext)) {
    return `Invalid file type. Allowed: ${profile.label}.`;
  }

  if (!profile.mimeTypes.has(file.mimetype)) {
    return "Invalid file MIME type.";
  }

  return null;
};

const createFileFilter = (fieldProfiles) => (req, file, cb) => {
  const profileName = fieldProfiles[file.fieldname] || "document";
  const errorMessage = validateFileAgainstProfile(file, profileName);
  if (errorMessage) {
    return cb(new Error(errorMessage));
  }
  cb(null, true);
};

const getMaxSizeForFields = (fieldProfiles) => {
  const sizes = Object.values(fieldProfiles).map(
    (profileName) => getProfile(profileName).maxSizeBytes
  );
  return Math.max(...sizes);
};

const formatSizeLimitMessage = (maxSizeBytes) => {
  const mb = Math.round(maxSizeBytes / (1024 * 1024));
  return `File too large. Maximum size is ${mb} MB.`;
};

const createUploadHandler = ({ type, field, fields, profile = "document" }) => {
  let multerInstance;

  if (type === "single") {
    const selectedProfile = getProfile(profile);
    multerInstance = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: selectedProfile.maxSizeBytes, files: 1 },
      fileFilter: (req, file, cb) => {
        const errorMessage = validateFileAgainstProfile(file, profile);
        if (errorMessage) return cb(new Error(errorMessage));
        cb(null, true);
      },
    });
  } else if (type === "fields") {
    const fieldProfiles = Object.fromEntries(
      fields.map(({ name, profile: fieldProfile = "document" }) => [
        name,
        fieldProfile,
      ])
    );

    multerInstance = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: getMaxSizeForFields(fieldProfiles),
        files: fields.reduce((sum, item) => sum + (item.maxCount || 1), 0),
      },
      fileFilter: createFileFilter(fieldProfiles),
    });
  } else {
    throw new Error(`Unsupported upload handler type: ${type}`);
  }

  const runMulter =
    type === "single"
      ? multerInstance.single(field)
      : multerInstance.fields(fields);

  return (req, res, next) => {
    runMulter(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          const limit =
            type === "single"
              ? getProfile(profile).maxSizeBytes
              : getMaxSizeForFields(
                  Object.fromEntries(
                    fields.map(({ name, profile: fieldProfile = "document" }) => [
                      name,
                      fieldProfile,
                    ])
                  )
                );
          return res
            .status(400)
            .json({ message: formatSizeLimitMessage(limit) });
        }
        return res.status(400).json({ message: err.message });
      }
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  };
};

const handleDocumentUpload = createUploadHandler({
  type: "single",
  field: "document",
  profile: "document",
});

const handleGenericFileUpload = createUploadHandler({
  type: "single",
  field: "file",
  profile: "document",
});

const handleStartupImageUpload = createUploadHandler({
  type: "fields",
  fields: [
    { name: "profile_image", profile: "image", maxCount: 1 },
    { name: "background_image", profile: "image", maxCount: 1 },
  ],
});

const handleMentorLogoUpload = createUploadHandler({
  type: "fields",
  fields: [{ name: "mentor_logo", profile: "image", maxCount: 1 }],
});

const handleEventThumbnailUpload = createUploadHandler({
  type: "fields",
  fields: [{ name: "thumbnail", profile: "image", maxCount: 1 }],
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const getBucketName = () => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is missing");
  }
  return bucketName;
};

const buildObjectKey = (folder, file) => {
  const safeName = sanitizeOriginalName(file.originalname);
  return `${folder}/${Date.now()}-${safeName}`;
};

const uploadFileToS3 = async (
  file,
  { folder, storeKeyOnly = false, encrypt = false } = {}
) => {
  if (!file) return null;
  if (!folder) {
    throw new Error("S3 upload folder is required.");
  }

  const bucketName = getBucketName();
  const key = buildObjectKey(folder, file);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ...(encrypt ? { ServerSideEncryption: "AES256" } : {}),
  });

  await s3.send(command);

  if (storeKeyOnly) {
    return key;
  }

  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

const uploadToS3 = async (file, folder = "Startups") => {
  return uploadFileToS3(file, { folder, storeKeyOnly: false });
};

const uploadFundingDocumentToS3 = async (file, startupId) => {
  return uploadFileToS3(file, {
    folder: `Funding/${startupId}`,
    storeKeyOnly: true,
    encrypt: true,
  });
};

const parseStoredS3Key = (storedValue, allowedPrefix) => {
  if (!storedValue || typeof storedValue !== "string") return null;

  const trimmed = storedValue.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith(`${allowedPrefix}/`)) {
    return trimmed.includes("..") ? null : trimmed;
  }

  const bucketName = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucketName || !region) return null;

  const publicPrefix = `https://${bucketName}.s3.${region}.amazonaws.com/`;
  if (trimmed.startsWith(publicPrefix)) {
    const key = trimmed.slice(publicPrefix.length);
    if (key.includes("..") || !key.startsWith(`${allowedPrefix}/`)) {
      return null;
    }
    return key;
  }

  return null;
};

const parseFundingDocumentKey = (storedValue) =>
  parseStoredS3Key(storedValue, "Funding");

const getPresignedDownloadUrl = async (storedValue, allowedPrefix) => {
  const key = parseStoredS3Key(storedValue, allowedPrefix);
  if (!key) return null;

  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 900 });
};

const getFundingDocumentPresignedUrl = async (storedValue) =>
  getPresignedDownloadUrl(storedValue, "Funding");

const deleteStoredFile = async (storedValue, allowedPrefix) => {
  const key = parseStoredS3Key(storedValue, allowedPrefix);
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  await s3.send(command);
};

const deleteFundingDocumentFromS3 = async (storedValue) =>
  deleteStoredFile(storedValue, "Funding");

module.exports = {
  UPLOAD_PROFILES,
  sanitizeOriginalName,
  createUploadHandler,
  handleDocumentUpload,
  handleGenericFileUpload,
  handleStartupImageUpload,
  handleMentorLogoUpload,
  handleEventThumbnailUpload,
  uploadFileToS3,
  uploadToS3,
  uploadFundingDocumentToS3,
  parseStoredS3Key,
  parseFundingDocumentKey,
  getPresignedDownloadUrl,
  getFundingDocumentPresignedUrl,
  deleteStoredFile,
  deleteFundingDocumentFromS3,
};