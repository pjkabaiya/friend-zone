function addUniqueReaction(doc, userId, emoji) {
  const current = doc.reactedBy || [];
  const existing = current.find(
    (entry) => entry.user?.toString() === userId.toString() && entry.emoji === emoji
  );

  if (existing) {
    return false;
  }

  current.push({ user: userId, emoji });
  doc.reactedBy = current;

  const count = doc.reactions.get(emoji) || 0;
  doc.reactions.set(emoji, count + 1);
  return true;
}

module.exports = {
  addUniqueReaction
};
