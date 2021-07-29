<template>
  <div class="home">
    <div class="openModal" @click="show = !show" :class="{ show: show }">
      <i class="material-icons">
        chevron_left
      </i>
    </div>
    <div class="toolbox" :class="{ show: show }">
      <div class="sticky-top bg-primary shadow-sm p-2 text-white info-search">
        <div class="d-flex justify-content-between my-2 align-items-center">
          <div class="h2">星期{{ todayWeek }}</div>
          <div class="text-end">
            {{ todayDate }}
            <p class="mb-0 small text-end text-white">綠色表示還有成人口罩</p>
          </div>
        </div>
        <div class="row mb-3 g-0">
          <label for="city" class="col-md-2 col-form-label">縣市</label>
          <div class="col-md-10">
            <select id="cityName" class="form-select rounded-pill" v-model="select.county" @change="select.town = '', select.search = ''">
              <option value="" disabled selected>-- 請選擇縣市 --</option>
              <option :value="c.CityName" v-for="c in countyName" :key="c">{{ c.CityName }}</option>
            </select>
          </div>
        </div>
        <div class="row mb-3 g-0">
          <label for="town" class="col-md-2 col-form-label">地區</label>
          <div class="col-md-10">
            <select id="townName" class="form-select rounded-pill" v-model="select.town" @change="updateMarker">
              <option value="" disabled selected>-- 請選擇地區 --</option>
              <option :value="town.AreaName" v-for="town in (countyName.find(item => item.CityName === select.county)).AreaList" :key="town.AreaName">
                {{ town.AreaName }}
              </option>
            </select>
          </div>
        </div>
        <input class="form-control rounded-pill mb-3" type="text" placeholder="請輸入藥局名稱 + Enter" v-model="select.search" :disabled="!select.county || !select.town" @change="searchData">
      </div>
      <div class="list-group sreenScroll">
        <a href="#" class="list-group-item list-group-item-action" v-for="pharmacy in pharmacies" :key="pharmacy" @click.prevent="panTo(pharmacy)">
          <h2 class="h4">{{ pharmacy.properties.name }}</h2>
          <p class="my-1">{{ pharmacy.properties.address }}</p>
          <p class="my-1">{{ pharmacy.properties.phone }}</p>
          <div class="masks d-flex justify-content-between text-white">
            <p class="my-1 me-2 w-50 d-flex justify-content-between rounded-pill py-1 px-3" :class="pharmacy.properties.mask_adult !==0? 'bg-maskAdult': 'bg-noMask'">
              成人口罩<strong>{{ pharmacy.properties.mask_adult }}</strong>
            </p>
            <p class="my-1 w-50 d-flex justify-content-between rounded-pill py-1 px-3" :class="pharmacy.properties.mask_child !==0? 'bg-maskChild': 'bg-noMask'">
              兒童口罩<strong>{{ pharmacy.properties.mask_child }}</strong>
            </p>
          </div>
        </a>
      </div>
    </div>
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet'
import countyName from '../assets/cityName.json'
import moment from 'moment'

const iconSettings = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}

const icons = {
  green: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    ...iconSettings
  }),
  grey: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    ...iconSettings
  })
}

let osmMap = {}

export default {
  data () {
    return {
      maskData: [],
      countyName,
      select: {
        county: '臺北市',
        town: '大安區'
      },
      pharmacies: [],
      todayDate: '',
      todayWeek: '',
      show: true
    }
  },
  methods: {
    getData () {
      const url = 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json'
      this.$http.get(url)
        .then(res => {
          this.maskData = res.data.features
          this.getMarker()
        })
        .catch(err => {
          console.log(err)
        })
    },
    getMap () {
      osmMap = L.map('map', {
        center: [25.03, 121.55],
        zoom: 16
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OSM</a> contributors'
      }).addTo(osmMap)
    },
    getMarker () {
      this.pharmacies = this.maskData.filter((pharmacy) => {
        if (!this.select.town) {
          return pharmacy.properties.county === this.select.county
        } else {
          return pharmacy.properties.county === this.select.county && pharmacy.properties.town === this.select.town
        }
      })

      if (this.pharmacies && this.pharmacies.length !== 0) {
        this.panTo(this.pharmacies[0])
        this.pharmacies.forEach((pharmacy) => {
          const { geometry, properties } = pharmacy
          const icon = pharmacy.properties.mask_adult !== 0 ? icons.green : icons.grey
          const bgAdult = pharmacy.properties.mask_adult !== 0 ? 'bg-maskAdult' : 'bg-noMask'
          const bgChild = pharmacy.properties.mask_child !== 0 ? 'bg-maskChild' : 'bg-noMask'
          L.marker([
            geometry.coordinates[1],
            geometry.coordinates[0]
          ], { icon }).addTo(osmMap)
            .bindPopup(`
              <h2 class="h4">${properties.name}</h2>
              <p class="my-1">${properties.address}</p>
              <p class="my-1">${properties.phone}</p>
              <div class="masks d-flex justify-content-between text-white">
                <p class="my-1 me-2 w-50 d-flex justify-content-between rounded-pill p-1 ${bgAdult}">
                  成人口罩<strong>${properties.mask_adult}</strong>
                </p>
                <p class="my-1 w-50 d-flex justify-content-between rounded-pill p-1 ${bgChild}">
                  兒童口罩<strong>${properties.mask_child}</strong>
                </p>
              </div>
            `, { maxWidth: 250, minWidth: 200 })
        })
      } else {
        alert('today no serves')
      }
    },
    updateMarker () {
      this.removeMarkers()
      this.getMarker()
    },
    panTo (pharmacy) {
      const { geometry, properties } = pharmacy
      osmMap.flyTo([geometry.coordinates[1], geometry.coordinates[0]], 16)
      const icon = pharmacy.properties.mask_adult !== 0 ? icons.green : icons.grey
      const bgAdult = pharmacy.properties.mask_adult !== 0 ? 'bg-maskAdult' : 'bg-noMask'
      const bgChild = pharmacy.properties.mask_child !== 0 ? 'bg-maskChild' : 'bg-noMask'
      L.marker([
        geometry.coordinates[1],
        geometry.coordinates[0]
      ], { icon }).addTo(osmMap)
        .bindPopup(`
          <h2 class="h4">${properties.name}</h2>
          <p class="my-1">${properties.address}</p>
          <p class="my-1">${properties.phone}</p>
          <div class="masks d-flex justify-content-between text-white">
            <p class="my-1 me-2 w-50 d-flex justify-content-between rounded-pill p-1 ${bgAdult}">
              成人口罩<strong>${properties.mask_adult}</strong>
            </p>
            <p class="my-1 w-50 d-flex justify-content-between rounded-pill p-1 ${bgChild}">
              兒童口罩<strong>${properties.mask_child}</strong>
            </p>
          </div>
        `, { maxWidth: 250, minWidth: 200 }).openPopup()
    },
    removeMarkers () {
      osmMap.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
          osmMap.removeLayer(layer)
        }
      })
    },
    getDate () {
      this.todayDate = moment().format('YYYY-MM-DD')
      this.todayWeek = this.$weekToChinese(moment().format('dddd'))
    },
    searchData () {
      this.removeMarkers()
      this.getMarker()
      this.pharmacies = this.pharmacies.filter((item) => {
        return item.properties.name.match(this.select.search)
      })
    }
  },
  mounted () {
    this.getData()
    this.getMap()
    this.getDate()
  }
}
</script>
