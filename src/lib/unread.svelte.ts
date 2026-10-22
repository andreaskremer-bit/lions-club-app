// Zähler ungelesener Benachrichtigungen (Badge am „Mehr“-Tab und auf /mehr).
//
// Eigener Zustand statt nur `data.unread` aus dem Root-Load: Um den Zähler aufzufrischen,
// müsste sonst der Root-Load neu laufen – und mit ihm jede Seite, die `await parent()`
// nutzt; offene Formulare (Kommentar, Antworten) würden dabei zurückgesetzt.
// Die Funktionen dazu stehen in `unread.ts`.

export const unread = $state({ count: 0 });
