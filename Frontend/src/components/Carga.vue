<template>
  <div class="home-blank">
    <div class="logo-reveal" aria-label="Coding 404">
      <img src="/images/Coding-404-logo.png" alt="" class="logo-base" />
      <img src="/images/Coding-404-logo.png" alt="Coding 404" class="logo-fill" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Carga',
  mounted() {
    setTimeout(() => {
      this.$emit('show-inicio');
    }, 3000);
  }
}
</script>

<style scoped>
.home-blank {
  min-height: 100vh;
  background: #233dff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-reveal {
  position: relative;
  width: 90%;
  max-width: 520px;
}

.logo-base,
.logo-fill {
  width: 100%;
  height: auto;
  display: block;
}

.logo-base {
  opacity: 0.15;
}

.logo-fill {
  position: absolute;
  inset: 0;
  clip-path: inset(0 100% 0 0);
  animation: fillLogo 2s ease-in-out forwards;
}

@keyframes fillLogo {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}
</style>
