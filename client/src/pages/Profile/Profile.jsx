import "./Profile.css";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  return (
    <section className="profile-page">
      <div className="container">
        <div className="profile-card">
          <img src="https://i.pravatar.cc/200" alt="profile" />

          <h2>{user?.name}</h2>

          <p>{user?.email}</p>

          <button>Edit Profile</button>
        </div>
      </div>
    </section>
  );
}

export default Profile;
