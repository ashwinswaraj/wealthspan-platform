# Catalyst functions

Project: Wealthspan (Catalyst). Deploy from this folder with the Catalyst CLI:

    npm i -g zcatalyst-cli
    catalyst login
    catalyst init        # pick the existing "Wealthspan" project, keep functions/auth
    cd functions/auth && npm install && cd ../..
    catalyst deploy

## functions/auth (email OTP / magic-link login)
Env variables to set on the function (Catalyst console → Functions → auth → Configuration):
- `FROM_EMAIL` — a sender verified in Catalyst Mail
- `APP_URL` — the web app's URL (used in magic links), no trailing slash

Tests (login rules only): `cd functions/auth && npm test`.

Unverified until the first deploy: the Node SDK calls in `index.js`, `lib/catalyst-store.js`,
`lib/mailer.js` (`catalyst.initialize`, `zcql().executeZCQLQuery`, `datastore().table().insertRow/updateRow`,
`email().sendMail`, `userManagement().generateCustomToken`), the `stack` value in `catalyst-config.json`,
and how Data Store returns `used_at` datetimes. Fix against real responses, don't guess.
