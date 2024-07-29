import Image from 'next/image'

import nivoIcon from '@/assets/nivo-icon.svg'

export function Header() {
  return (
    <div className="mx-auto flex max-w-[1200px] items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src={nivoIcon} alt="Nivo" className="size-6" />
      </div>

      <div className="flex items-center gap-4"></div>
    </div>
  )
}
