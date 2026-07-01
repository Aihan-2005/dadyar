export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch(
      "http://meabbaspour.endpointforge.ir:4000/dadyar/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    return Response.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error(error)

    return Response.json(
      { message: "Register Proxy Error" },
      { status: 500 }
    )
  }
}