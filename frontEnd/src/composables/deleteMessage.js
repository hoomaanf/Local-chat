async function deleteMessage(id, serverIp) {
  const response = await fetch(`http://${serverIp}:3000/api/message/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete message");
  }
  return await response.json();
}

export default deleteMessage;
