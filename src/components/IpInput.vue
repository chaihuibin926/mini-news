<template>
  <div class="server-selection">
    <h2>服务器连接</h2>
    <div class="input-group">
      <label for="ipAddress">IP 地址：</label>
      <input
        type="text"
        id="ipAddress"
        v-model="ipAddress"
        placeholder="例如：192.168.1.1"
      />
    </div>
    <div class="input-group">
      <label for="port">端口号：</label>
      <input
        type="number"
        id="port"
        v-model="port"
        placeholder="例如：8080"
      />
    </div>
    <button id="connect-btn" @click="connectionServer">连接服务器</button>
  </div>
</template>

<script setup lang="ts">
  import {defineModel, onMounted} from 'vue'

  const props = defineProps<{
    onConnection: (ipAddress: string, port: number) => void;
  }>()

  const ipAddress = defineModel<string>('')
  const port = defineModel<number>()

  function connectionServer() {
    if (ipAddress.value && port.value) {
      props.onConnection(ipAddress.value, port.value)
      localStorage.setItem('mini-news', JSON.stringify({ip: ipAddress.value, port: port.value}))
    } else {
      alert("请填写完整的IP地址和端口号");
    }
  }

  onMounted(() => {
    document.getElementById('connect-btn')?.addEventListener('click', connectionServer)
    const catchData = JSON.parse(localStorage.getItem('mini-news') ?? "{}")

    if (catchData.ip && catchData.port) {
      props.onConnection(catchData.ip, catchData.port)
    }
  })
</script>

<style scoped>
  .server-selection {
    max-width: 300px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .input-group {
    margin-bottom: 15px;
  }

  input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  button {
    width: 100%;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  p {
    margin-top: 15px;
    font-weight: bold;
  }
</style>
