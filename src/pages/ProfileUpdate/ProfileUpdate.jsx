import React, { useContext, useEffect, useState } from 'react'  // FIX 1: added useContext import
import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {

  const navigate = useNavigate();

  const [image, setImage] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();
    try {
      if (!prevImage && !image) {
        toast.error("Upload a profile picture");
        return;
      }

      const docRef = doc(db, "users", uid);
      if (image) {
        const imgUrl = await upload(image);
        setPrevImage(imgUrl);
        await setDoc(docRef, {
          avatar: imgUrl,
          bio: bio,
          name: name,
        }, {merge: true});
      } else {
        await setDoc(docRef, {
          bio: bio,
          name: name,
        }, {merge: true});
      }

      // FIX 2: fetch updated data and navigate ONCE, after setUserData
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      toast.success("Profile updated successfully!");
      navigate('/chat');  // removed duplicate navigate('/chat') that fired before setUserData

    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return;

        const data = docSnap.data();
        if (data.name)   setName(data.name);
        if (data.bio)    setBio(data.bio);
        if (data.avatar) setPrevImage(data.avatar);

      } else {
        navigate('/');
      }
    });
  }, []);

  return (
    <div className="profile">
      <div className="profile-container">

        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>

          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : assets.avatar_icon}
              alt=""
            />
            Upload profile image
          </label>

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          ></textarea>

          <button type="submit">Save</button>
        </form>

        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) : prevImage ? prevImage : assets.logo_icon}
          alt=""
        />

      </div>
    </div>
  )
}

export default ProfileUpdate