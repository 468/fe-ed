import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import World from "./World";
import SignOut from "./SignOut";

function Main(): JSX.Element {
  const session = useSession();
  const supabase = useSupabaseClient();
  return (
    <>
      {!session ? (
        <div className="w-1/3 h-full items-center align-center m-auto justify-center">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={[]}
            redirectTo="https://www.fe-ed.world"
          />
        </div>
      ) : (
        <>
          <World />
          <SignOut />
        </>
      )}
    </>
  );
}

export default Main;
