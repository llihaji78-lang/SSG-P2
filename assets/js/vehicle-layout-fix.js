/* SSG-P vehicle-page presentation-only patch.
   Load AFTER vehicle-registered-ticket.js to retain its click and registration handlers. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'vehicle') return;

  function placeTicketAfterLocator() {
    const locator = document.getElementById('vehicleLocator');
    const ticket = document.getElementById('ssgpRegisteredTicket');
    if (!locator || !ticket) return;
    // Moving an existing node preserves all listeners, modal dialogs and ticket actions.
    if (locator.nextElementSibling !== ticket) locator.insertAdjacentElement('afterend', ticket);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', placeTicketAfterLocator);
  } else {
    placeTicketAfterLocator();
  }
})();
