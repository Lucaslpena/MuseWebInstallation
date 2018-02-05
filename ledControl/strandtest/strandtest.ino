#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
  #include <avr/power.h>
#endif

#define PIN 6
#define PIN_B 3

Adafruit_NeoPixel strip = Adafruit_NeoPixel(79, PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip_b = Adafruit_NeoPixel(79, PIN_B, NEO_GRB + NEO_KHZ800);

int avg = 0, gotten = 0;
int state = 0; // 0 = idle, 1 = changing up; 2 = headset on; 3 changing down;
unsigned long previousMillis = millis();
unsigned long previousMillis2 = millis();
unsigned long timeOn = millis();
int winning = 10;
boolean newUser = true;
int lastPush = 0;
int j, keepOn;

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
  j = 0;
  keepOn = false;
}
void establishContact() {
  if (Serial.available() <= 0) {
    Serial.print('A');   // send a capital A
    delay(300);
  }
}
void loop() {
//  if (keepOn == true){
//    state = 1;
//  }
  if (Serial.available()) {
    checkNow();
    if( (state == 2) && ( (gotten >= 0) && (gotten <= 79)) && (keepOn == false)){
      avg = gotten;
      medidate(5);
    }
   else if( (gotten == 1000) || (state == 1) || (keepOn == true) ){
      //change keep on?
      newUser = true;
      state = 1;
      rainbowCycle(5); 
    } 
  } 
}

void medidate(uint8_t wait) {
  avg = (avg == 0) ? 79 : avg;
  unsigned long currentMillis = millis();

  /* FOR AVG MOVEMENT */
  if( (lastPush == 0) || ( (avg < lastPush+10 )  && (avg > lastPush-10 ) ) ){ 
    lastPush = avg;
    previousMillis = currentMillis;
    }
  if (currentMillis - previousMillis >= 2500){
    previousMillis = currentMillis;
    lastPush = avg;
  }
  /*************/

  if((currentMillis - timeOn >= 5000) && ((lastPush <= winning) && (lastPush > 0))){ //if end
    state = 1;
    avg = 0;
    winningAnimation();
  } else if (state != 1) {
    if (newUser == true){
      newUser = false;
      colorWipe(strip.Color(2,56,82), 5); // Blue
    }
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
  checkNow();
}

void rainbowCycle(uint8_t wait) {
  newUser = true;
  uint16_t i;//, j;
  for (uint16_t k=0; k< 6; k++) {
    for(i=0; i< strip.numPixels(); i++) {
        strip.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
        strip_b.setPixelColor(i, Wheel(((i * 256 / strip.numPixels()) + j) & 255));
      }
     j+=2;
     if (j>=256){
      j = 0;
     }
  }
   strip_b.show();
   strip.show();
   checkUp();
}

void checkNow(){
  gotten = Serial.parseInt();
}

void checkUp(){
  checkNow();
  if ( (gotten > 0) && (gotten <= 79) ){
    state = 2;
    timeOn = millis();
  } else if (gotten == 1000){
    keepOn = false;
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
  for(uint16_t i=strip.numPixels(); i>0; i--) {
    strip.setPixelColor(i, c);
    strip.show();
    strip_b.setPixelColor(i, c);
    strip_b.show();
    delay(wait);
  }
}
void winningAnimation() {
  keepOn = true;
  colorWipe(strip.Color(255,231,0), 20); // yellow
  colorWipe(strip.Color(0, 255, 0), 36); // Green
    for (uint16_t i=0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i, strip.Color(0,153,218));
      strip_b.setPixelColor(i, strip.Color(0,153,218));
    }
    strip.show();
    strip_b.show();
    delay(1000);
    for (uint16_t i=0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i, strip.Color(255,231,0));
      strip_b.setPixelColor(i, strip.Color(255,231,0));
    }
    strip.show();
    strip_b.show();
    delay(1000);
    for (uint16_t i=0; i < strip.numPixels(); i++) {
      strip.setPixelColor(i, strip.Color(0,153,218));
      strip_b.setPixelColor(i, strip.Color(0,153,218));
    }
    strip.show();
    strip_b.show();
    delay(1000);
    for (uint16_t i=0; i < strip.numPixels(); i++) {
     strip.setPixelColor(i, strip.Color(255,231,0));
      strip_b.setPixelColor(i, strip.Color(255,231,0));
    }
    strip.show();
    strip_b.show();
    delay(1000);
}

