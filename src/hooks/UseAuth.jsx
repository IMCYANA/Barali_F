import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth/auth.service";

const useAuth = () => {
  const currentUser = AuthService.getCurrentUser();

  const [isUser, setIsUser] = useState(currentUser || null);
  const [isMember, setIsMember] = useState(
    currentUser ? currentUser.roles.includes("ROLE_MEMBER") : false
  );
  const [isAdmin, setIsAdmin] = useState(
    currentUser ? currentUser.roles.includes("ROLE_ADMIN") : false
  );
  const [isModerator, setIsModerator] = useState(
    currentUser ? currentUser.roles.includes("ROLE_MODERATOR") : false
  );

  const navigate = useNavigate();

  const logOut = () => {
    AuthService.logout();
    setIsUser(null);
    setIsMember(false);
    setIsAdmin(false);
    setIsModerator(false);

    navigate("/");
  };

  const isLoggedIn = !!currentUser;

  return { isUser, isMember, isAdmin, isModerator, isLoggedIn, logOut };
};

export default useAuth;
