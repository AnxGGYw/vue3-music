<template>
  <div class="player">
    <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img :src="currentSong.pic" />
      </div>
      <div class="top">
        <div class="back" @click="handleMiniClick">
          <i class="icon-back"></i>
        </div>
        <h1 class="title">{{ currentSong.name }}</h1>
        <h2 class="subtitle">{{ currentSong.singer }}</h2>
      </div>
      <div class="bottom">
        <div class="operators">
          <div class="icon i-left">
            <i :class="playModeIcon" @click="changePlayMode"></i>
          </div>
          <div class="icon i-left" :class="disabledClass">
            <i class="icon-prev" @click="handlePre"></i>
          </div>
          <div class="icon i-center" :class="disabledClass">
            <i :class="playIcon" @click="togglePlay"></i>
          </div>
          <div class="icon i-right" :class="disabledClass">
            <i class="icon-next" @click="handleNext"></i>
          </div>
          <div class="icon i-right">
            <i :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
          </div>
        </div>
      </div>
    </div>
    <audio
      ref="audioRef"
      @pause="handleAudioPause"
      @canplay="handleAudioCanPlay"
      @error="handleAudioError"
    ></audio>
  </div>
</template>

<script>
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { SET_FULL_SCREEN, SET_PLAYING, SET_CURRENT_INDEX } from '@/store/mutation-types'
import useMode from './use-mode'
import useFavorite from './use-favorite'
export default {
  name: 'player',
  setup() {
    const audioRef = ref(null)
    const songReady = ref(null)

    // & vuex
    const store = useStore()

    const currentSong = computed(() => store.getters.currentSong)
    const fullScreen = computed(() => store.getters.fullScreen)
    const playing = computed(() => store.getters.playing)
    const playList = computed(() => store.getters.playList)
    const currentIndex = computed(() => store.getters.currentIndex)

    // & hooks
    const { playModeIcon, changePlayMode } = useMode()
    const { getFavoriteIcon, toggleFavorite } = useFavorite()

    // & computed
    const playIcon = computed(() => (playing.value ? 'icon-pause' : 'icon-play'))
    const disabledClass = computed(() => (songReady.value ? '' : 'disable'))

    // & user watch
    watch(currentSong, newSong => {
      if (!newSong.id || !newSong.url) {
        return
      }
      songReady.value = false
      const audioElement = audioRef.value
      audioElement.src = newSong.url
      audioElement.play()
    })

    watch(playing, newPlaying => {
      if (!songReady.value) {
        return
      }
      const audioElement = audioRef.value
      newPlaying ? audioElement.play() : audioElement.pause()
    })

    // & methods
    const handleMiniClick = () => {
      store.commit(SET_FULL_SCREEN, false)
    }

    const togglePlay = () => {
      if (!songReady.value) {
        return
      }
      store.commit(SET_PLAYING, !playing.value)
    }

    const handlePre = () => {
      if (playList.value.length === 1) {
        loop()
      } else {
        changeCurrentSong(false)
      }
    }

    const handleNext = () => {
      if (playList.value.length === 1) {
        loop()
      } else {
        changeCurrentSong(true)
      }
    }

    // ! 修改当前播放歌曲 (上一曲和下一曲的逻辑)
    const changeCurrentSong = isNext => {
      const list = playList.value
      if (!songReady.value || !list.length) {
        return
      }
      let index = null
      if (isNext) {
        // * 已经是最后一曲, 则跳到第一曲
        index = (currentIndex.value + 1) % list.length
      } else {
        // * 已经是第一曲, 则跳到最后一曲
        index = currentIndex.value - 1
        index = index < 0 ? list.length - 1 : index
      }
      store.commit(SET_CURRENT_INDEX, index)
      if (!playing.value) {
        store.commit(SET_PLAYING, true)
      }
    }

    // ! 循环播放, 直接设置 audio 标签的 currentTime = 0
    const loop = () => {
      const audioElement = audioRef.value
      audioElement.currentTime = 0
      audioElement.play()
    }

    // ! audio 触发了 pause 事件 (eg: 笔记本屏幕合上等等...), 将 playing 设置成 false
    const handleAudioPause = () => {
      store.commit(SET_PLAYING, false)
    }

    // ! canplay 用于控制歌曲是否能播放
    const handleAudioCanPlay = () => {
      if (songReady.value) {
        return
      }
      songReady.value = true
    }

    // ! 歌曲加载错误的时候, songReady 设置为 true, 防止不能点击上一曲, 下一曲
    const handleAudioError = () => {
      songReady.value = true
    }

    return {
      // * ref
      audioRef,
      //* vuex
      currentSong,
      fullScreen,
      // * hooks mode
      playModeIcon,
      changePlayMode,
      // * hooks favorite
      getFavoriteIcon,
      toggleFavorite,
      // * computed
      playIcon,
      disabledClass,
      // * methods
      handleMiniClick,
      togglePlay,
      handleAudioPause,
      handlePre,
      handleNext,
      handleAudioCanPlay,
      handleAudioError
    }
  }
}
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);

      img {
        width: 100%;
        height: 100%;
      }
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
      }
      .icon-back {
        display: block;
        padding: 9px;
        font-size: $font-size-large-x;
        color: $color-theme;
        transform: rotate(-90deg);
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            img {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }
            .playing {
              animation: rotate 20s linear infinite;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
            &.current {
              color: $color-text;
            }
          }
          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 40px;
          line-height: 30px;
          width: 40px;
          &.time-l {
            text-align: left;
          }
          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: $color-theme;
          &.disable {
            color: $color-theme-d;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i {
            font-size: 40px;
          }
        }
        .i-right {
          text-align: left;
        }
        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }
    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.6s;
      .top,
      .bottom {
        transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
      }
    }
    &.normal-enter-from,
    &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }
}
</style>