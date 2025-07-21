async function useEditMessage(id, data, serverIp) {
  const response = await fetch(`http://${serverIp}:3000/api/message/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to edit message");
  }
  return await response.json();
}

export default useEditMessage;
