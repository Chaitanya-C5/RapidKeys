import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const COMMON_WORDS = [
  "word", "buy", "too", "frighten", "some", "saw", "offer", "possible", "never", "chest",
  "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "cat", "run", "fast",
  "apple", "orange", "banana", "grape", "pear", "peach", "melon", "berry", "tree", "leaf",
  "light", "dark", "blue", "green", "red", "yellow", "white", "black", "gray", "pink",
  "house", "car", "road", "river", "mountain", "cloud", "sky", "rain", "snow", "wind",
  "book", "pen", "desk", "chair", "lamp", "room", "phone", "glass", "bottle", "cup",
  "fire", "water", "earth", "air", "stone", "metal", "wood", "iron", "gold", "silver",
  "smile", "laugh", "cry", "sleep", "dream", "think", "feel", "know", "walk", "stand",
  "left", "right", "up", "down", "front", "back", "inside", "outside", "near", "far",
  "happy", "sad", "angry", "tired", "kind", "brave", "strong", "weak", "smart", "slow",
  "jump", "kick", "pull", "push", "hold", "throw", "catch", "drop", "climb", "slide",
  "music", "song", "dance", "beat", "sound", "voice", "noise", "quiet", "loud", "calm",
  "school", "teacher", "student", "class", "test", "exam", "paper", "chalk", "board", "bell",
  "food", "bread", "rice", "milk", "cheese", "butter", "egg", "meat", "fish", "soup"
];

export const calculateStats = (correctCharCount, incorrectCharCount, elapsedTime, currentWordIndex, words) => {
  const totalChars = correctCharCount + incorrectCharCount
  const accuracy = totalChars === 0 ? 100 : Math.round((correctCharCount / totalChars) * 100).toFixed(2)
  const minutes = elapsedTime / 60
  const wpm = minutes > 0 ? (correctCharCount / 5) / minutes : 0
  const progress = Math.round((currentWordIndex / words.length) * 100)

  return { wpm, accuracy, progress }
}