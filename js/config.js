/* Wedding details used across the site: edit here.
   Personal invitation links: add ?to=Guest%20Name to the site address, e.g. index.html?to=Rahul%20Sharma */
window.WEDDING = {
  guestDefault: 'Family & Friends',            // shown when the link has no ?to=
  target: '2026-12-11T21:00:00+05:30',         // countdown target (the pheras), India time
  venue: 'Mandap Lawn',                        // destination shown on page 2
  city: 'Jaipur, Rajasthan',
  // Last page, Wishing Wall: the first cards on the wall. Guests' own wishes are added after these.
  wishes: [
    { name: 'Nani Ji', wish: 'May your home always be filled with laughter, love and the fragrance of fresh jasmine. Sada sukhi raho!' },
    { name: 'Rohan & Priya', wish: 'Two beautiful souls, one beautiful journey. Wishing you a lifetime of adventures together.' },
    { name: 'Mama Ji', wish: 'May Lord Ganesha bless your new life with happiness, health and prosperity.' },
    { name: 'Ananya', wish: 'Cannot wait to dance at the sangeet! Congratulations to the most adorable couple.' },
    { name: 'Sharma Family', wish: 'Heartiest congratulations! May your bond grow stronger with every passing year.' },
    { name: 'Kabir', wish: 'Shubh, you found your best friend. Ayushi, welcome to the madness. Love you both!' }
  ],
  // Optional: a web address that stores wishes for everyone (e.g. a Google Apps Script web app).
  // GET returns [{name, wish}], POST receives {name, wish}. Leave empty to keep wishes on each guest's own phone.
  wishesUrl: ''
};
