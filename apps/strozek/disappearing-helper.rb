include Magick

ALPHA = 0.299
BETA = 0.587

def MakeMask(width, height)
  mask = Image.new(width, height)
  i = 0.3
  for y in 0..(height-1)
    for x in 0..(width-1)
      alpha = ALPHA+(rand(25)-12)/1000.0
      beta = BETA+(rand(25)-12)/1000.0
      gamma = 1.0-alpha-beta
      gmin = [(i-gamma-alpha)/beta, 0].max
      gmax = i/beta
      g = (gmax*x+gmin*(width-x-1))/(1.0*(width-1))
      rmin = [(i-beta*g-gamma)/alpha, 0].max
      rmax = [(i-beta*g)/alpha, 0].max
      r = (rmax*y+rmin*(height-y-1))/(1.0*(height-1))
      b = (i-alpha*r-beta*g)/gamma
      if(b<0)
        r = 0
        g = 0
        b = 0
      end
      c2 = Pixel.new(r*MaxRGB, g*MaxRGB, b*MaxRGB)
      hsl = c2.to_HSL
      if(hsl[2]>0.3)
        hsl[2] = (((hsl[2]-0.3)/0.35)**0.8)*0.2+0.3
      end
      c2 = Pixel.from_HSL(hsl)
      mask.pixel_color(x, y, c2)
    end
  end
  return mask
end

def GetTextMetrics(str)
  text = Magick::Draw.new
  text.font = 'Bookman-Demi'
  text.pointsize = 40
  text.gravity = Magick::CenterGravity
  return text.get_type_metrics(str)
end

def MakeText(image, str, verticalOffset)
  text = Magick::Draw.new
  text.font = 'Bookman-Demi'
  text.pointsize = 40
  text.gravity = Magick::CenterGravity
  text.annotate(image, 0, 0, 0, verticalOffset, str) {self.fill = 'white'}
end

def FindMaskColor(mask, i)
  success = false
  x1 = mask.columns*0.08
  x2 = mask.columns*0.54
  x3 = mask.columns*0.78
  y = mask.rows*0.47
  until success
    xm = rand(x3-x1)
    ym = rand(y)
    if(xm<=(x2-x1) && ym>xm*(y/(x2-x1)))
      xm = (x2-x1)-xm
      ym = y-ym
    end
    if(xm>(x2-x1) && ym>((x3-x1)-xm)*(y/(x3-x2)))
      xm = x3+x2-xm-2*x1
      ym = y-ym
    end
    xm += x1
    im = mask.pixel_color(xm, ym).intensity()/(1.0*MaxRGB)
    if((i-im).abs < 0.05)
      success = true
    end
  end
  return mask.pixel_color(xm, ym)
end

def FindGrayColor(i, x, y)
  alpha = ALPHA*1000.0+rand(25)-12
  beta = BETA*1000.0+rand(25)-12
  gamma = 1000.0-alpha-beta
  ratio = (alpha-gamma)/beta
  if ((x%8<4) ^ (y%8<4))
    r = (0.37+i/3.0)*MaxRGB
    g = (0.62-i*ratio/3.0)*MaxRGB
    b = (0.8-i/3.0)*MaxRGB
  else
    r = (0.44+i/3.0)*MaxRGB
    g = (0.62-i*ratio/3.0)*MaxRGB
    b = (0.9-i/3.0)*MaxRGB
  end
  return Pixel.new(r, g, b)
end

def FindDistractionColor(c, i)
  success = false
  until success
    red = (rand()*0.12-0.04)*MaxRGB
    if(c.red+red<0)
      red = -c.red
    end
    if(c.red+red>MaxRGB)
      red = MaxRGB-c.red
    end
    green = (rand()*0.12-0.04)*MaxRGB
    if(c.green+green<0)
      green = -c.green
    end
    if(c.green+green>MaxRGB)
      green = MaxRGB-c.green
    end
    blue = -(red*ALPHA+green*BETA)/(1.0-ALPHA-BETA)
    success = (c.blue+blue>=0 && c.blue+blue<=MaxRGB)
  end
  return Pixel.new(c.red+red*i, c.green+green*i, c.blue+blue*i)
end

def GenerateBWDisappearingImage(message)
  metrics = GetTextMetrics(message)
  width = metrics.width+20
  height = metrics.height+20
  colorText = Image.new(width, height) { self.background_color = "black" }
  MakeText(colorText, message, 0)
  for y in 0..(height-1)
    for x in 0..(width-1)
      c = colorText.pixel_color(x, y)
      i = c.intensity()/(1.0*MaxRGB)
      i = rand()*0.33 + i*0.33 + 0.33
      colorText.pixel_color(x, y, FindGrayColor(i, x, y))
    end
  end
  colorText.format = "PNG"
  return colorText
end

def GenerateColorDisappearingImage(message, distractionString)
  metrics = GetTextMetrics(message)
  distractionMetrics = GetTextMetrics(distractionString)
  width = [metrics.width, distractionMetrics.width].max+20
  height = [metrics.height, distractionMetrics.height].max+20
  mask = MakeMask(width, height)
  grayText = Image.new(width, height) { self.background_color = "black" }
  MakeText(grayText, message, 0)
  distraction = Image.new(width, height) { self.background_color = "black" }
  MakeText(distraction, distractionString, 0)
  for y in 0..(height-1)
    for x in 0..(width-1)
      c = grayText.pixel_color(x, y)
      i = c.intensity()/(1.0*MaxRGB)
      i = (1-i)*0.08 + 0.18
      c2 = FindMaskColor(mask, i)
      di = distraction.pixel_color(x, y).intensity()/(1.0*MaxRGB)
      grayText.pixel_color(x, y, FindDistractionColor(c2, di))
    end
  end
  grayText.format = "PNG"
  return grayText
end
