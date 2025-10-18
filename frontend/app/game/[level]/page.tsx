import GamePageClient from './GamePageClient'

// Required for static export
export function generateStaticParams() {
  return [
    { level: 'level1' },
    { level: 'level2' },
    { level: 'level3' },
  ]
}

export default function GamePage({ params }: { params: { level: string } }) {
  return <GamePageClient level={params.level} />
}
