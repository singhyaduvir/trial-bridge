ON OPEN: 
app.tsx -> HERO
    - Get Started -> RoleSelection.tsx
        -Clicking on any of the three roles assigns that constant to the user and routes to the respective dashboard/landing page
        -> Patient -> PatientDashboard.tsx
            -> Eligibility form -> On completion: TrialsMatchView.tsx (/matches)
            -> Medical documents upload (/patient/documents)
        -> HCP -> [Later take to login] -> HCP dashboard (Import)
        -> Investigator -> [Later take to login] Investigator dashboard (Import)

    - Header Links