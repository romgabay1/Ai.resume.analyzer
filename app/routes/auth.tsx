import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
import { usePuterStore } from "../lib/puter";

export const meta = () => ([
  {title:"Resume analyzer | Auth"},
  {name: "description", content: "Log into Your Account"},
])





const Auth = () => {
    const {isLoading, auth} = usePuterStore();
    const location = useLocation();
    const next=location.search.split("next=")[1];
    const navigate = useNavigate();

useEffect(() => {
if(auth.isAuthenticated) navigate(next)}
, [auth.isAuthenticated, next])

  return (
<main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">  
<div className="gradient-border shadow-lg">
    <section className="flex flex-col gap-8 bg-white p-10 rounded-2xl">
    <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <h2 className="text-lg">Log into Your Account</h2>
    </div>
    <div>
        {isLoading ?( 
            <button className="auth-button animate-pulse">
                <p> Signing in...</p>
            </button>
        ):(
            auth.isAuthenticated ?(
                <button className="auth-button" onClick={auth.signOut}>
                    <p> Log Out</p>
                </button>
            ):(
                <button className="auth-button" onClick={auth.signIn}>
                    <p> Log In</p>
                </button>
            )
        )}
        
    </div>
    </section>
</div>
</main> 
  )
}

export default Auth