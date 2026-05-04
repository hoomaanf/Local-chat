export default async function useCheckPing(serverIp) {
  try {
    const response = await fetch(`http://${serverIp}:3000/api/ping`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
