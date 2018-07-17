Name: tendrl-ui
Version: 1.6.3
Release: 7%{?dist}
BuildArch: noarch
Summary: GUI for Tendrl
License: LGPLv2+
Group:   Applications/System
Source0: %{name}-%{version}.tar.gz
Source1: tendrl-ui-build-pkgs.tar.gz
URL: https://github.com/Tendrl/ui

Requires: tendrl-api-httpd
BuildRequires: npm
BuildRequires: nodejs-packaging
BuildRequires: fontconfig

%description
Contains the JavaScript GUI content for the Tendrl front-end components
(dashboard, login screens, administration screens)

%prep
%autosetup
%setup -q -n %{name}-%{version}
%setup -T -D -a 1

%build
./node_modules/.bin/gulp
%{__rm} -r node_modules

%install
install -m 755 -d $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl
cp -a ./dist/* $RPM_BUILD_ROOT/%{_localstatedir}/www/tendrl/

%files
%{_localstatedir}/www/tendrl/
%doc ./docs/*
%license LICENSE

%changelog
* Tue Jul 17 2018 Neha Gupta <negupta@redhat.com> - 1.6.3-7
- Bugfixes (https://github.com/Tendrl/ui/milestone/10)

* Fri Jul 13 2018 Neha Gupta <negupta@redhat.com> - 1.6.3-6
- Bugfixes (https://github.com/Tendrl/ui/milestone/9)

* Wed Jul 04 2018 Neha Gupta <negupta@redhat.com> - 1.6.3-5
- Bugfixes (https://github.com/Tendrl/ui/milestone/8)

* Fri Jun 15 2018 Neha Gupta <negupta@redhat.com> - 1.6.3-4
- Bugfixes (https://github.com/Tendrl/ui/milestone/7)

* Tue May 29 2018 Neha Gupta <negupta@redhat.com> - 1.6.3-3
- Bugfixes (https://github.com/Tendrl/ui/milestone/6)

* Wed May 16 2018 Neha Gupta <negupta@redhat.com> - 1.6.3-2
- Bugfixes tendrl-dashboard v1.6.3

* Thu Apr 19 2018 Rohan Kanade <rkanade@redhat.com> - 1.6.3-1
- Bugfixes (https://github.com/Tendrl/ui/milestone/5)

* Thu Mar 22 2018 Rohan Kanade <rkanade@redhat.com> - 1.6.2-1
- Bugfixes (https://github.com/Tendrl/ui/milestone/4)

* Wed Mar 07 2018 Rohan Kanade <rkanade@redhat.com> - 1.6.1-1
- Bugfixes (https://github.com/Tendrl/ui/milestone/3)

* Sat Feb 17 2018 Rohan Kanade <rkanade@redhat.com> - 1.6.0-1
- UI to un-manage clusters managed by Tendrl

* Fri Feb 02 2018 Rohan Kanade <rkanade@redhat.com> - 1.5.5-1
- Single Cluster / Element Manager Concept with Context Switcher Navigation
- Toast Notification ( PR #782 )
- Sort ( PR #781 )
- Datepicker (PR #786 )

* Tue Nov 21 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.4-4
- Bugfixes-3 tendrl-dashboard v1.5.4

* Sat Nov 18 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.4-3
- Bugfixes-2 tendrl-dashboard v1.5.4

* Fri Nov 10 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.4-2
- Bugfixes tendrl-dashboard v1.5.4

* Thu Nov 02 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.4-1
- Release tendrl-dashboard v1.5.4

* Fri Oct 13 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.3-2
- BugFixes for tendrl-dashboard v1.5.3

* Thu Oct 12 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.3-1
- Release tendrl-dashboard v1.5.3

* Fri Sep 15 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.2-1
- Release tendrl-dashboard v1.5.2

* Fri Aug 25 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.1-1
- Release tendrl-dashboard v1.5.1

* Fri Aug 04 2017 Rohan Kanade <rkanade@redhat.com> - 1.5.0-1
- Release tendrl-dashboard v1.5.0

* Thu Jun 08 2017 Rohan Kanade <rkanade@redhat.com> - 1.4.1-1
- Release tendrl-dashboard v1.4.1

* Fri Jun 02 2017 Rohan Kanade <rkanade@redhat.com> - 1.4.0-2
- Fixes https://github.com/Tendrl/dashboard/pull/398

* Fri Jun 02 2017 Rohan Kanade <rkanade@redhat.com> - 1.4.0-1
- Release tendrl-dashboard v1.4.0

* Thu May 18 2017 <rkanade@redhat.com> 1.3.0-1
- Release tendrl-dashboard v1.3.0

* Thu Nov 10 2016 <kchidamb@redhat.com> 0.0.1-1
- Initial Commit
