import { useSupabaseClient } from "@supabase/auth-helpers-react";

const SignOut = () => {
  console.log("sign out loaded");
  const supabase = useSupabaseClient();

  return (
    <div className="fixed z-[100] bottom-0 right-0 text-white m-8 text-xs">
      <button className="" onClick={() => supabase.auth.signOut()}>
        Sign Out
      </button>
    </div>
  );
};

export default SignOut;
