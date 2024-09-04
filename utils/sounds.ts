export const playIncomingMessageSound = () => {
  const audio = new Audio('/audio/jug-pop-1.mp3');
  audio.play();
};

export const playSentMessageSound = () => {
  const audio = new Audio('/audio/jug-pop-3.mp3');
  audio.play();
};
