var settings = {
    endpoint: 'https://chart.googleapis.com/chart'
};

/**
 * @TODO clean up docs
 * cht=qr    Required    Specifies a QR code.
 chs=<width>x<height>    Required     Image size.
 chl=<data>    Required    The data to encode. Data can be digits (0-9), alphanumeric characters, binary bytes of data, or Kanji. You cannot mix data types within a QR code. The data must be UTF-8 URL-encoded. Note that URLs have a 2K maximum length, so if you want to encode more than 2K bytes (minus the other URL characters), you will have to send your data using POST.
 choe=<output_encoding>    Optional    How to encode the data in the QR code. Here are the available values:
 UTF-8 [Default]
 Shift_JIS
 ISO-8859-1
 chld=<error_correction_level>|<margin>    Optional
 error_correction_level - QR codes support four levels of error correction to enable recovery of missing, misread, or obscured data. Greater redundancy is achieved at the cost of being able to store less data. See the appendix for details. Here are the supported values:
 L - [Default] Allows recovery of up to 7% data loss
 M - Allows recovery of up to 15% data loss
 Q - Allows recovery of up to 25% data loss
 H - Allows recovery of up to 30% data loss
 margin - The width of the white border around the data portion of the code. This is in rows, not in pixels. (See below to learn what rows are in a QR code.) The default value is 4.
 */
exports.qr = function (width, height, data) {
    if (!width) return ('Missing width.');
    if (!height) return ('Missing height.');
    if (!data) return ('Missing data.');
    return (settings.endpoint + '?cht=qr&chs=' + width + 'x' + height + '&chl=' + data);
};