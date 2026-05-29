# bep-chrome-extension
Chrome extension for filling forms automagically in BEP (BayArea Event Publisher)
Use short, concrete justifications. Chrome mainly wants to know why each permission is necessary and that you’re using the least access needed. Officially, permissions must be declared in the manifest, and scripting requires either host permissions or activeTab for temporary page access.

Suggested Chrome Web Store permission justifications

storage

Used to temporarily store LocalBuzz event data needed for autofill, such as title, date, location, description, and platform status. The extension does not store passwords, payment data, or browsing history.

activeTab

Used to access only the current tab after the user explicitly clicks “Open and Autofill.” This lets LocalBuzz fill the event submission form on the active partner website without requesting broad access to all websites.

scripting

Used to inject the LocalBuzz autofill script into the active partner website so event fields can be filled automatically. This is required for form automation and is only triggered by the user’s action.
Strong note to include in review notes
LocalBuzz follows least-privilege access. The extension does not run continuously across all sites. It activates only when the user chooses to autofill an event submission form, and it uses activeTab instead of broad host permissions wherever possible.

Also, list only your actual partner domains in host_permissions if you have them. Avoid <all_urls> unless absolutely necessary.
