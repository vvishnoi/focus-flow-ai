import GameCanvas from '@/components/GameCanvas'

export function generateStaticParams() {
  return [
    { level: 'level1' },
    { level: 'level2' },
    { level: 'level3' },
  ]
}

export default function GamePage({ params }: { params: { level: string } }) {
  return <GameCanvas level={params.level} />
}
