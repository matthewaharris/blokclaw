export default function ValidationBadge({ valid, contractType }) {
  if (contractType !== 'openapi' || valid === null || valid === undefined) return null

  return valid ? (
    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
      Valid OpenAPI
    </span>
  ) : (
    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
      Invalid OpenAPI
    </span>
  )
}
