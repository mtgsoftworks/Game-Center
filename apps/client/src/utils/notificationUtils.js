// src/utils/notificationUtils.js

export function playSound() {
    const audio = new Audio('/assets/notification.mp3');
    audio.play();
  }
  
  export function changeDocumentTitle(count) {
    document.title = `(${count}) Yeni Bildirim - Oyun Merkezi`;
  }