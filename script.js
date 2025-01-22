// WMS 요청 변수 설정 (어린이대상 범죄주의구간)
const apiKey = "IDS3A9QP-IDS3-IDS3-IDS3-IDS3A9QPCJ"; // 어린이대상 범죄주의구간 API 키
const kidLayerName = "A2SM_ODBLRCRMNLHSPOT_KID";
const kidStyleName = "A2SM_OdblrCrmnlHspot_Kid";
const kidWmsUrl = `https://www.safemap.go.kr/openApiService/wms/getLayerData.do?apikey=${apiKey}`;

// WMS 요청 변수 설정 (노인대상 범죄주의구간)
const elderApiKey = "OWB0YJ7I-OWB0-OWB0-OWB0-OWB0YJ7IUX"; // 노인대상 범죄주의구간 API 키
const elderLayerName = "A2SM_ODBLRCRMNLHSPOT_ODSN";
const elderStyleName = "A2SM_OdblrCrmnlHspot_Odsn";
const elderWmsUrl = `https://www.safemap.go.kr/openApiService/wms/getLayerData.do?apikey=${elderApiKey}`;

// WMS 요청 변수 설정 (성폭력 범죄주의구간)
const rapeApiKey = "M1D2C748-M1D2-M1D2-M1D2-M1D2C748SD"; // 성폭력 범죄주의구간 API 키
const rapeLayerName = "A2SM_CRMNLHSPOT_TOT";
const rapeStyleName = "A2SM_CrmnlHspot_Tot_Rape";
const rapeWmsUrl = `https://www.safemap.go.kr/openApiService/wms/getLayerData.do?apikey=${rapeApiKey}`;

// 지도 생성
const map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM() // 기본 지도 레이어
        }),
        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: kidWmsUrl,
                params: {
                    'LAYERS': kidLayerName,
                    'STYLES': kidStyleName,
                    'FORMAT': 'image/png',
                    'TRANSPARENT': true
                },
                serverType: 'geoserver'
            }),
            visible: false // 기본적으로 어린이대상 범죄주의구간은 숨김
        }),
        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: elderWmsUrl,
                params: {
                    'LAYERS': elderLayerName,
                    'STYLES': elderStyleName,
                    'FORMAT': 'image/png',
                    'TRANSPARENT': true
                },
                serverType: 'geoserver'
            }),
            visible: false // 기본적으로 노인대상 범죄주의구간은 숨김
        }),
        new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: rapeWmsUrl,
                params: {
                    'LAYERS': rapeLayerName,
                    'STYLES': rapeStyleName,
                    'FORMAT': 'image/png',
                    'TRANSPARENT': true
                },
                serverType: 'geoserver'
            }),
            visible: false // 기본적으로 성폭력 범죄주의구간은 숨김
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([126.9784, 37.5665]), // 서울 시청 기준
        zoom: 12
    })
});

// 레이어 표시/숨기기 기능
document.getElementById('toggleKidLayer').addEventListener('click', () => {
    const kidLayer = map.getLayers().item(1);
    kidLayer.setVisible(!kidLayer.getVisible());
    updateButtonState('toggleKidLayer', kidLayer.getVisible());
    ensureLayerUpdate();
});

document.getElementById('toggleElderLayer').addEventListener('click', () => {
    const elderLayer = map.getLayers().item(2);
    elderLayer.setVisible(!elderLayer.getVisible());
    updateButtonState('toggleElderLayer', elderLayer.getVisible());
    ensureLayerUpdate();
});

document.getElementById('toggleRapeLayer').addEventListener('click', () => {
    const rapeLayer = map.getLayers().item(3);
    rapeLayer.setVisible(!rapeLayer.getVisible());
    updateButtonState('toggleRapeLayer', rapeLayer.getVisible());
    ensureLayerUpdate();
});

// 체크박스 스타일 업데이트
function updateButtonState(buttonId, isVisible) {
    const button = document.getElementById(buttonId);
    if (isVisible) {
        button.innerHTML += " ✅"; // 체크 표시 추가
    } else {
        button.innerHTML = button.innerHTML.replace(" ✅", ""); // 체크 표시 제거
    }
}

// 내 위치 찾기
document.getElementById('location').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const coords = position.coords;
            const userLocation = ol.proj.fromLonLat([coords.longitude, coords.latitude]);

            // 내 위치를 빨간 점으로 표시 (점 크기 줄이기)
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(userLocation)
            });
            const vectorSource = new ol.source.Vector({
                features: [marker]
            });
            const vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6, // 점 크기 줄이기
                        fill: new ol.style.Fill({ color: 'red' }),
                        stroke: new ol.style.Stroke({ color: 'white', width: 2 })
                    })
                })
            });
            map.addLayer(vectorLayer);

            // 지도의 중심을 내 위치로 설정하고 줌 레벨을 14로 설정
            map.getView().setCenter(userLocation);
            map.getView().setZoom(14);

            // 범죄주의구간 레이어가 활성화되어 있을 때, 지도 업데이트 강제 실행
            ensureLayerUpdate();
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// 레이어 업데이트 강제 실행
function ensureLayerUpdate() {
    const layers = map.getLayers().getArray();
    layers.forEach(layer => {
        if (layer instanceof ol.layer.Tile) {
            layer.getSource().refresh(); // 레이어 소스 새로 고침
        }
    });
}

// 지도 아래의 OpenStreetMap 저작권 정보 제거
const osmLayer = map.getLayers().item(0);
osmLayer.setSource(new ol.source.OSM({
    attributions: [] // 저작권 정보 제거
}));

// reset rotation 버튼 제거
const rotateControl = map.getControls().getArray().find(control => control instanceof ol.control.Rotate);
map.removeControl(rotateControl);
