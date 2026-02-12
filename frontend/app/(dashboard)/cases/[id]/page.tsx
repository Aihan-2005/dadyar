type CaseDetailPageProps = {
  params: {
    id: string
  }
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Case Detail</h1>
      <p className="mt-2 text-gray-600">Case ID: {params.id}</p>
    </div>
  )
}
