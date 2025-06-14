import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const MembershipCard = ({ member, onIssueCard, isIssuing }) => {
  const canvasRef = useRef(null);

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Return the lines and the total height
    return {
      lines,
      totalHeight: lines.length * lineHeight
    };
  };

  const findFontSize = (ctx, text, maxWidth, maxHeight, initialSize) => {
    let fontSize = initialSize;
    ctx.font = `bold ${fontSize}px Arial`;
    
    while (fontSize > 12) { // Don't go smaller than 12px
      const { lines, totalHeight } = wrapText(ctx, text, 0, 0, maxWidth, fontSize * 1.2);
      
      // Check if text fits within constraints
      if (totalHeight <= maxHeight && lines.length <= 3) { // Limit to 3 lines
        break;
      }
      
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    
    return fontSize;
  };

  const generateCard = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Load background image
    const backgroundImage = new Image();
    backgroundImage.src = '/card_template.png';

    // Wait for background image to load and set canvas dimensions to match it
    await new Promise((resolve) => {
      backgroundImage.onload = () => {
        canvas.width = backgroundImage.width;
        canvas.height = backgroundImage.height;
        resolve();
      };
    });

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Generate QR code as data URL
    const qrSize = Math.min(canvas.width, canvas.height) * 0.5;
    const qrCodeDataUrl = await QRCode.toDataURL(member.memberId, {
      width: qrSize,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Load QR code image
    const qrImage = new Image();
    qrImage.src = qrCodeDataUrl;

    // Wait for QR code image to load
    await new Promise((resolve) => {
      qrImage.onload = resolve;
    });

    // Draw QR code at the center, but shifted up
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = (canvas.height - qrSize) / 2 - (canvas.height * 0.14);
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    // Calculate available space for text
    const maxTextWidth = canvas.width * 0.8; // 80% of canvas width
    const maxTextHeight = canvas.height * 0.2; // 20% of canvas height
    
    // Configure text style for name and find appropriate font size
    const fontSize = findFontSize(ctx, member.fullName, maxTextWidth, maxTextHeight, Math.floor(canvas.height * 0.05) - 2);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';

    // Calculate text positions
    // Ensure there's enough space below QR code before starting text
    const textStartY = qrY + qrSize + 450; // Add 450px padding below QR code
    
    // Draw wrapped name
    const { lines: nameLines } = wrapText(ctx, member.fullName, canvas.width / 2, textStartY, maxTextWidth, fontSize * 1.2);
    nameLines.forEach((line, index) => {
      ctx.fillText(line.trim(), canvas.width / 2, textStartY + (index * fontSize * 1.2));
    });

    // Configure text style for department (not bold and smaller)
    const deptFontSize = fontSize - 40; // Reduced the size difference
    ctx.font = `${deptFontSize}px Arial`;
    ctx.fillStyle = '#ffffff'; // Change department text color to black

    // Draw department with less spacing from name
    const deptY = textStartY + (nameLines.length * fontSize * 1.2) + (fontSize * 0.1); // Reduced spacing to 0.3x
    ctx.fillText(member.department, canvas.width / 2, deptY);
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${member.fullName.replace(/\s+/g, '_')}_card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    onIssueCard(); // Call the onIssueCard function after downloading
  };

  useEffect(() => {
    if (member) {
      generateCard();
    }
  }, [member]);

  return (
    <div>
      <canvas 
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      <button
        onClick={downloadCard}
        disabled={isIssuing}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isIssuing ? 'Issuing Card...' : 'Download Card'}
      </button>
    </div>
  );
};

export default MembershipCard; 