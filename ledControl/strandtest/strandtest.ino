#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

#define PIN 6
#define PIN_B 3
// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
//   NEO_RGBW    Pixels are wired for RGBW bitstream (NeoPixel RGBW products)
Adafruit_NeoPixel strip = Adafruit_NeoPixel(79, PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip_b = Adafruit_NeoPixel(79, PIN_B, NEO_GRB + NEO_KHZ800);


// IMPORTANT: To reduce NeoPixel burnout risk, add 1000 uF capacitor across
// pixel power leads, add 300 - 500 Ohm resistor on first pixel's data input
// and minimize distance between Arduino and first pixel.  Avoid connecting
// on a live circuit...if you must, connect GND first.

int avg = 0, gotten = 0;
int state = 0; // 0 = idle, 1 = changing up; 2 = headset on; 3 changing down;
void setup() {
  Serial.begin(9600);
  
  // This is for Trinket 5V 16MHz, you can remove these three lines if you are not using a Trinket
  #if defined (__AVR_ATtiny85__)
    if (F_CPU == 16000000) clock_prescale_set(clock_div_1);
  #endif
  // End of trinket special code


  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
  
  strip_b.begin();
  strip_b.show();


  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  establishContact();
}
void establishContact() {
  if (Serial.available() <= 0) {
    Serial.print('A');   // send a capital A
    delay(300);
  }
}
void serialEvent() {
//  while (Serial.available()) {
//    // get the new byte:
//    gotten = Serial.parseInt();
//   if (gotten == 1000)  {
//    state = 1;
//   }
//  }
}

void loop() {
//rainbowCycleState();
//
//  if (state == 1){
//    rainbowCycle(5);
//  } else {
//    colorWipe(strip.Color(0,153,218), 50); // Green
//  }
 
  if (Serial.available()) {
    gotten = Serial.parseInt();
//    if (state == 2){
//      state = 3;
//      colorWipe(strip.Color(0,153,218), 50); // Green
//      //do nothing .. noise
//    }
//    else
    if (gotten == 1000)  {
      state = 1;
      rainbowCycle(5); 
      //rainbowCycleState();
    } else if( (gotten >= 0) && (gotten <= 79)) {
      avg = gotten;
      medidate(5);
    } 
    
    else {
      //do nothing
    }
  }
}

int lastPush = 0; 
float lastT = millis();
void medidate(uint8_t wait) {

  if( (lastPush == 0) || ( (avg < lastPush+10 )  && (avg > lastPush-10 ) ) || (lastT - millis() >= 500)){ lastT = millis(); lastPush = avg; }
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    if (i < lastPush ){
      strip.setPixelColor(i, strip.Color(2,56,82));
      strip_b.setPixelColor(i, strip.Color(2,56,82));
    } else { 
      strip.setPixelColor(i, strip.Color(255,231,0));
      strip_b.setPixelColor(i, strip.Color(255,231,0));
    }
  }
  strip.show();
  strip_b.show();
}

// Slightly different, this makes the rainbow equally distributed throughout
void rainbowCycle(uint8_t wait) {
  uint16_t i, j;
  for(j=0; j<256; j++) { // 5 cycles of all colors on wheel
    for(i=0; i< strip.numPixels(); i++) {
      strip.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
      strip_b.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
    }
    checkUp();
    strip_b.show();
    strip.show();
    delay(wait);
  }
}

void checkUp(){
  if ((state != 2) && (Serial.available()) ) {
    gotten = Serial.parseInt();
    if ( (gotten != 1000) && (state = 1) ){
      state = 2;
    }
  }
}
// Input a value 0 to 255 to get a color value.
// The colours are a transition r - g - b - back to r.
uint32_t Wheel(byte WheelPos) { 
  WheelPos = 255 - WheelPos;
  if(WheelPos < 85) {
    return strip.Color(255 - WheelPos * 3, 0, WheelPos * 3);
  }
  if(WheelPos < 170) {
    WheelPos -= 85;
    return strip.Color(0, WheelPos * 3, 255 - WheelPos * 3);
  }
  WheelPos -= 170;
  return strip.Color(WheelPos * 3, 255 - WheelPos * 3, 0);
}

void colorWipe(uint32_t c, uint8_t wait) {
  for(uint16_t i=0; i<strip.numPixels(); i++) {
    strip.setPixelColor(i, c);
    strip.show();
    strip_b.setPixelColor(i, c);
    strip_b.show();
    delay(wait);
  }
}
