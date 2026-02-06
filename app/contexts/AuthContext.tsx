"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { User, AuthContextType, LoginResponse } from "../types/auth";

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => ({ success: false }),
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const initialCheckComplete = useRef(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for stored token on app start
  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth-token");

        if (storedToken) {
          // Verify token with server
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            }/api/auth/verify-token`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${storedToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setToken(storedToken);
              setUser({
                ...data.user,
                createdAt: "",
                isActive: true,
              });
            } else {
              // Token is invalid, remove it
              localStorage.removeItem("auth-token");
            }
          } else {
            // Token is invalid, remove it
            localStorage.removeItem("auth-token");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-token");
        }
      } finally {
        initialCheckComplete.current = true;
        setLoading(false);
      }
    };

    checkAuth();
  }, [mounted]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        }/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data: LoginResponse = await response.json();

      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser({
          ...data.user,
          createdAt: "",
          isActive: true,
        });
        localStorage.setItem("auth-token", data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth-token");
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { User };






// "use client";

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   useCallback,
//   useRef,
// } from "react";
// import { User, AuthContextType, LoginResponse } from "../types/auth";

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   login: async () => ({ success: false }),
//   logout: () => {},
//   loading: true,
// });

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [mounted, setMounted] = useState(false);
//   const initialCheckComplete = useRef(false);

//   // Hydration ఎర్రర్స్ రాకుండా ఉండటానికి
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // యాప్ స్టార్ట్ అయినప్పుడు యూజర్ లాగిన్ అయి ఉన్నాడో లేదో చెక్ చేస్తుంది
//   useEffect(() => {
//     if (!mounted) return;

//     const checkAuth = async () => {
//       try {
//         const storedToken = localStorage.getItem("auth-token");
//         const storedUser = localStorage.getItem("auth-user");

//         if (storedToken) {
//           // మీ బ్యాకెండ్ లో verify-token (404) లేదు కాబట్టి, 
//           // ప్రస్తుతానికి టోకెన్ ఉంటే యూజర్ ని సెట్ చేస్తున్నాము.
//           setToken(storedToken);
//           if (storedUser) {
//             setUser(JSON.parse(storedUser));
//           } else {
//             // ఒకవేళ యూజర్ డేటా లేకపోతే డిఫాల్ట్ డేటా
//             setUser({ username: "admin", role: "admin", createdAt: "", isActive: true } as User);
//           }
//         }
//       } catch (error) {
//         console.error("Error checking auth:", error);
//         localStorage.removeItem("auth-token");
//         localStorage.removeItem("auth-user");
//       } finally {
//         initialCheckComplete.current = true;
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, [mounted]);

//   // Login Function
//   const login = useCallback(async (username: string, password: string) => {
//     try {
//       setLoading(true);
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://103.189.178.118:3001";
      
//       const response = await fetch(`${apiUrl}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });

//       const data: LoginResponse = await response.json();

//       // గమనిక: మీ బ్యాకెండ్ data.token మరియు data.user పంపడం లేదు.
//       // కేవలం success: true మాత్రమే పంపిస్తోంది. అందుకే ఈ కింద మార్పు చేశాను.
//       if (data.success) {
//         // బ్యాకెండ్ నుండి రాకపోయినా మనం ఒక టెంపరరీ టోకెన్ సెట్ చేస్తున్నాం
//         const sessionToken = data.token || "manual-session-token";
//         const sessionUser = data.user || { 
//           username: username, 
//           role: "admin", 
//           createdAt: new Date().toISOString(), 
//           isActive: true 
//         };

//         setToken(sessionToken);
//         setUser(sessionUser as User);

//         // Local Storage లో సేవ్ చేయడం వల్ల పేజీ రీఫ్రెష్ అయినా లాగిన్ పోదు
//         localStorage.setItem("auth-token", sessionToken);
//         localStorage.setItem("auth-user", JSON.stringify(sessionUser));

//         return { success: true };
//       } else {
//         return { success: false, error: data.error || "Invalid credentials" };
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       return { success: false, error: "Network error. Please check your connection." };
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Logout Function
//   const logout = useCallback(() => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem("auth-token");
//     localStorage.removeItem("auth-user");
//     window.location.href = "/login"; // Logout అయినప్పుడు లాగిన్ పేజీకి పంపడం
//   }, []);

//   const value: AuthContextType = {
//     user,
//     token,
//     isAuthenticated: !!token, // టోకెన్ ఉంటే లాగిన్ అయినట్లు
//     login,
//     logout,
//     loading,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
