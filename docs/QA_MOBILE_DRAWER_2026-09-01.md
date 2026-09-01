# QA: Mobile drawer — 2026-09-01

The TEXT.AI workspace was captured at 375×812 and 430×932. In both captures the sidebar is closed by default, the top-right menu affordance is visible, the composer remains within the viewport, and the RTL message layout remains readable. The composer controls retain touch-sized spacing and the suggestion cards stack without horizontal overflow.

The screenshots validate the responsive layout and closed-by-default state. Opening and closing actions remain event-driven through the menu button, drawer close button, and backdrop; these controls should receive a final manual interaction check in the browser before release.
