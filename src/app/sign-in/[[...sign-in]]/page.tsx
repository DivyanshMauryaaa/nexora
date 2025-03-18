import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return(
    <div>
        <div className='ml-[730px] mt-[20px]'>
            <SignIn />
        </div>
    </div>
  )
}