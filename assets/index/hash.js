function rotateRight(a,b){return b>>>a|b<<32-a}function choice(a,b,c){return a&b^~a&c}function majority(a,b,c){return a&b^a&c^b&c}function sha256_Sigma0(a){return rotateRight(2,a)^rotateRight(13,a)^rotateRight(22,a)}function sha256_Sigma1(a){return rotateRight(6,a)^rotateRight(11,a)^rotateRight(25,a)}function sha256_sigma0(a){return rotateRight(7,a)^rotateRight(18,a)^a>>>3}function sha256_sigma1(a){return rotateRight(17,a)^rotateRight(19,a)^a>>>10}
function sha256_expand(a,b){return a[b&15]+=sha256_sigma1(a[b+14&15])+a[b+9&15]+sha256_sigma0(a[b+1&15])}
var K256=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,
4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],ihash,count,buffer,sha256_hex_digits="0123456789abcdef";function safe_add(a,b){var c=(a&65535)+(b&65535);return(a>>16)+(b>>16)+(c>>16)<<16|c&65535}
function sha256_init(){ihash=Array(8);count=Array(2);buffer=Array(64);count[0]=count[1]=0;ihash[0]=1779033703;ihash[1]=3144134277;ihash[2]=1013904242;ihash[3]=2773480762;ihash[4]=1359893119;ihash[5]=2600822924;ihash[6]=528734635;ihash[7]=1541459225}
function sha256_transform(){var a,b=Array(16);var c=ihash[0];var e=ihash[1];var d=ihash[2];var g=ihash[3];var h=ihash[4];var k=ihash[5];var l=ihash[6];var m=ihash[7];for(a=0;16>a;a++)b[a]=buffer[(a<<2)+3]|buffer[(a<<2)+2]<<8|buffer[(a<<2)+1]<<16|buffer[a<<2]<<24;for(var f=0;64>f;f++){a=m+sha256_Sigma1(h)+choice(h,k,l)+K256[f];a=16>f?a+b[f]:a+sha256_expand(b,f);var n=sha256_Sigma0(c)+majority(c,e,d);m=l;l=k;k=h;h=safe_add(g,a);g=d;d=e;e=c;c=safe_add(a,n)}ihash[0]+=c;ihash[1]+=e;ihash[2]+=d;ihash[3]+=
g;ihash[4]+=h;ihash[5]+=k;ihash[6]+=l;ihash[7]+=m}function sha256_update(a,b){var c,e=0;var d=count[0]>>3&63;var g=b&63;(count[0]+=b<<3)<b<<3&&count[1]++;count[1]+=b>>29;for(c=0;c+63<b;c+=64){for(;64>d;d++)buffer[d]=a.charCodeAt(e++);sha256_transform();d=0}for(d=0;d<g;d++)buffer[d]=a.charCodeAt(e++)}
function sha256_final(){var a=count[0]>>3&63;buffer[a++]=128;if(!(56>=a)){for(;64>a;a++)buffer[a]=0;sha256_transform();a=0}for(;56>a;a++)buffer[a]=0;buffer[56]=count[1]>>>24&255;buffer[57]=count[1]>>>16&255;buffer[58]=count[1]>>>8&255;buffer[59]=count[1]&255;buffer[60]=count[0]>>>24&255;buffer[61]=count[0]>>>16&255;buffer[62]=count[0]>>>8&255;buffer[63]=count[0]&255;sha256_transform()}
function sha256_encode_bytes(){for(var a=0,b=Array(32),c=0;8>c;c++)b[a++]=ihash[c]>>>24&255,b[a++]=ihash[c]>>>16&255,b[a++]=ihash[c]>>>8&255,b[a++]=ihash[c]&255;return b}function sha256_encode_hex(){for(var a=new String,b=0;8>b;b++)for(var c=28;0<=c;c-=4)a+=sha256_hex_digits.charAt(ihash[b]>>>c&15);return a}function sha256_digest(a){sha256_init();sha256_update(a,a.length);sha256_final();return sha256_encode_hex()}
function sha256_self_test(){return"f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650"==sha256_digest("message digest")};