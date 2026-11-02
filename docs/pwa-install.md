# SideQuests installable web app

SideQuests is now prepared as an online-only installable web app. Deploy the Next.js project to a permanent HTTPS domain, then open that domain in Chrome on Android or in the Quest browser.

On Android Chrome, open the browser menu and choose **Add to Home screen** or **Install app**. The PWA manifest supplies the SideQuests launcher icon, standalone display mode, dark theme color, and app name. The app uses the generated cyan compass-portal artwork as its icon and a matching launch screen while the site initializes.

On Meta Quest, open the deployed HTTPS URL in the Browser. You can bookmark it, pin it for quick access, or use the browser’s available add-to-home or shortcut behavior. The web-app route is usually preferable to a generic APK wrapper because the current platform is a server-rendered Next.js application with live API routes for accounts, MangaDex, TMDB, and streaming providers.

The application remains online-only by design. Movies, shows, anime, and manga require an internet connection; the PWA installation does not turn third-party streams into local downloadable media.
