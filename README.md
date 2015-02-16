LokTar
======

EuroTrip(Lok'tar) for Tizen(Test App)

기능

    초기 컨셉은 여행을 가고자 하는 지역을 넣으면 여행 일정의 날씨를 보여주기 위한 앱을 목표로 시작
    하나의 api 사용만으론 부족한 것같아서 Google Maps API 사용
        지역 검색 기능 추가(자세한 지역을 모를때 런던 근교라는 가정하에 런던이라고 검색후 맵을 이동하여 위치 세팅)
        출발지 -> 경유지 -> 도착지 사이의 여정 표시
        출발지 -> 경유지 -> 도착지 사이의 거리 표시(자동차, 유럽한정... 구글api인데 왜 북미는 안되는가)

날씨 정보

    OpenWeatherMap(http://openweathermap.org/) 에서 제공하는 REST 사용
    초기에 야후에서 제공하는 것을 사용하려고 했으나 비밀 번호가 수정이 안되는 버그 인지 뭔지로 인해 OpenWeatherMap 사용
    선택한 지역의 기본 날씨 정보 및 7일간의 간단 날씨

거리 정보

    Google Maps API 사용(Distance, Direction API)
    아시아 및 다른 지역의 direction api가 지원되지 않는다...-> Europe내로 기능 제한(EuroTrip으로 수정)
    출발지 + 경유지(max 3) + 도착지의 direction 을 구글 맵으로 표시
    출발지 + 경유지(max 3) + 도착지 각각의 거리 및 자동차 이동 시간 표시