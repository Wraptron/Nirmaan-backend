import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function EditMentorForm() {
  const { id } = useParams();
  const [mentor, setMentor] = useState(null);

  useEffect(() => {
    // Replace this with your real API call
    fetch(`/api/mentor/${id}`)
      .then((res) => res.json())
      .then((data) => setMentor(data))
      .catch((err) => console.error("Error loading mentor:", err));
  }, [id]);

  if (!mentor) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Mentor: {mentor.mentor_name}</h1>
      {/* Your form fields go here */}
    </div>
  );
}
export default EditMentorForm;
