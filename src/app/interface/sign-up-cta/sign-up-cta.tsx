import { useOAuth } from "@/lib/useOAuth"
import { cn } from "@/lib/utils"

function SignUpCTA() {
  const { login, isLoggedIn } = useOAuth({ debug: false })
  if (isLoggedIn) { return null }
  return (
    <div className={cn(
      `print:hidden`,
      `fixed flex flex-col items-center bottom-24 top-28 right-2 md:top-17 md:right-6 z-10`,
    )}>
      /*È¥µÇÂ¼*/
    </div>
  )
}

export default SignUpCTA