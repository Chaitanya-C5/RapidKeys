# utils/word_generator.py

import random

# A small sample pool of words — replace or extend with your real dataset
COMMON_WORDS = [
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
]

def generate_words(mode: str, submode: int) -> list[str]:
    if mode == "words":
        if submode not in [10, 25, 50, 75]:
            raise ValueError("Invalid submode for words mode. Must be 10, 25, 50, or 75.")
        return random.choices(COMMON_WORDS, k=submode)

    elif mode == "time":
        if submode not in [15, 30, 60, 100]:
            raise ValueError("Invalid submode for time mode. Must be 15, 30, 60, or 100.")
        return random.choices(COMMON_WORDS, k=150)

    else:
        raise ValueError("Mode must be either 'words' or 'time'.")


if __name__ == "__main__":
    print("Words mode (25):", generate_words("words", 25))
    print("Time mode (30):", generate_words("time", 30))
