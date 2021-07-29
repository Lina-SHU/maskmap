<template>
  <div class="toolbox">
    <div class="sticky-top bg-primary shadow-sm p-2 text-white">
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
      <input class="form-control rounded-pill mb-3" type="text" placeholder="請輸入藥局名稱" v-model="select.search" :disabled="!select.county || !select.town" @change="searchData">
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
</template>

<script>
import countyName from '@/assets/cityName.json'

export default {
  data () {
    return {
      countyName,
      select: {
        county: '臺北市',
        town: '大安區',
        todayDate: '',
        todayWeek: ''
      }
    }
  },
  props: ['pharmacies']
}
</script>
