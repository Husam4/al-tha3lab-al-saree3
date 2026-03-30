import { createFileRoute } from '@tanstack/react-router'
import TypingGame from '../components/TypingGame'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <TypingGame />
}
