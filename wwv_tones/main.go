package main

import (
	"fmt"
	"math"
	"os"
	"time"

	"github.com/cryptix/wav"
)

const (
	bits = 32
	rate = 44100

	v_pulse_freq    = 1000
	h_pulse_freq    = 1200
	hour_pulse_freq = 1500

	amplitude = 0.6
)

type generator struct {
	rate float64
	bits int

	w *wav.Writer
}

func newGenerator(filename string) *generator {
	wavOut, err := os.Create(filename)

	meta := wav.File{
		Channels:        1,
		SampleRate:      rate,
		SignificantBits: bits,
	}

	writer, err := meta.NewWriter(wavOut)
	if err != nil {
		panic(err)
	}

	return &generator{
		rate: rate,
		bits: bits,
		w:    writer,
	}
}

func (g *generator) close() {
	g.w.Close()
}

func (g *generator) tone(freq float64, duration time.Duration) {
	samples := int(float64(g.rate) * duration.Seconds())
	for n := 0; n < samples; n += 1 {
		var y int32
		if freq > 0 {
			y = int32(amplitude * math.Pow(2, float64(g.bits-1)) * math.Sin((2*math.Pi/g.rate)*freq*float64(n)))
		}

		if err := g.w.WriteInt32(y); err != nil {
			panic(err)
		}
	}
}

func (g *generator) silence(duration time.Duration) {
	g.tone(0, duration)
}

func (g *generator) pulse(pfreq float64) {
	g.tone(pfreq, 5*time.Millisecond)
}

func (g *generator) pulse_tone(pfreq, tfreq float64, skip_end_gap bool) {
	g.tone(pfreq, 5*time.Millisecond)
	g.silence(25 * time.Millisecond)

	if skip_end_gap {
		g.tone(tfreq, 970*time.Millisecond)
	} else {
		g.tone(tfreq, 960*time.Millisecond)
		g.silence(10 * time.Millisecond)
	}
}

func (g *generator) pulse_long_tone(pfreq, tfreq float64) {
	g.tone(pfreq, 5*time.Millisecond)
	g.silence(25 * time.Millisecond)

	g.tone(tfreq, 1960*time.Millisecond)
	g.silence(10 * time.Millisecond)
}

func (g *generator) tone_seq(pfreq, tfreq float64) {
	for i := 1; i <= 28; i++ {
		g.pulse_tone(pfreq, tfreq, i == 28)
	}
	g.tone(tfreq, 990*time.Millisecond)
	g.silence(10 * time.Millisecond)

	for i := 30; i <= 58; i++ {
		g.pulse_tone(pfreq, tfreq, false)
	}
}

func main() {
	var g *generator

	g = newGenerator("v_minute_pulse.wav")
	g.tone(v_pulse_freq, 800*time.Millisecond)
	g.close()

	g = newGenerator("h_minute_pulse.wav")
	g.tone(h_pulse_freq, 800*time.Millisecond)
	g.close()

	g = newGenerator("hour_pulse.wav")
	g.tone(hour_pulse_freq, 800*time.Millisecond)
	g.close()

	//	for _, f := range []int{0, 440, 500, 600} {
	//		g := newGenerator(fmt.Sprintf("v_main_%d.wav", f))
	//		g.tone_seq(v_pulse_freq, float64(f))
	//		g.close()
	//	}
	//
	//	for _, f := range []int{0, 440, 500, 600} {
	//		g := newGenerator(fmt.Sprintf("h_main_%d.wav", f))
	//		g.tone_seq(h_pulse_freq, float64(f))
	//		g.close()
	//	}
	//
	//g = newGenerator("v_pulse_gap.wav")
	//for i := 0; i < 50; i++ {
	//	g.pulse_tone(v_pulse_freq, 0, false)
	//}
	//g.close()

	//g = newGenerator("h_pulse_gap.wav")
	//for i := 0; i < 50; i++ {
	//	g.pulse_tone(h_pulse_freq, 0, false)
	//}
	//g.close()

	//g = newGenerator("v_pulse.wav")
	//g.pulse(v_pulse_freq)
	//g.close()

	//g = newGenerator("h_pulse.wav")
	//g.pulse(h_pulse_freq)
	//g.close()

	for _, f := range []int{0, 440, 500, 600} {
		g := newGenerator(fmt.Sprintf("v_pulse_tone_%d.wav", f))
		g.pulse_tone(v_pulse_freq, float64(f), false)
		g.close()

		g = newGenerator(fmt.Sprintf("v_pulse_long_tone_%d.wav", f))
		g.pulse_long_tone(v_pulse_freq, float64(f))
		g.close()
	}

	for _, f := range []int{0, 440, 500, 600} {
		g := newGenerator(fmt.Sprintf("h_pulse_tone_%d.wav", f))
		g.pulse_tone(h_pulse_freq, float64(f), false)
		g.close()

		g = newGenerator(fmt.Sprintf("h_pulse_long_tone_%d.wav", f))
		g.pulse_long_tone(h_pulse_freq, float64(f))
		g.close()
	}
}
