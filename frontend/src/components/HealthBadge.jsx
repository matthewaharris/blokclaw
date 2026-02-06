export default function HealthBadge({ status }) {
  if (!status || status === 'unknown') return null

  const styles = {
    healthy: 'bg-green-100 text-green-700',
    degraded: 'bg-yellow-100 text-yellow-700',
    unhealthy: 'bg-red-100 text-red-700'
  }

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}
