var fs = require("fs");
var parser = require("properties-parser");

var required_strings = [
  "your_gift_help_us",
  "dear_name",
  "first_paragraph_email",
  "second_paragraph_email",
  "third_paragraph_email",
  "executive_director",
  "here_is_record",
  "gift_amount",
  "transaction_id",
  "mozilla_contribution",
  "more_info_about_page",
  "mozilla_foundation_tax_id"
];

var from = "/Users/jbuck/Documents/Github/donate.mozilla.org/locales/";
var to = "/Users/jbuck/Documents/Github/webmaker-mailroom/locale/";

var from_locales = fs.readdirSync(from)
  .filter((locale) => { return !locale.endsWith(".json"); })
  .filter((locale) => { return fs.existsSync(from + locale + "/email.properties"); });

from_locales.map((locale) => {
  var data = parser.read(from + locale + "/email.properties")

  var has_required_strings = required_strings.every((string) => { return !!data[string]; });
  if (!has_required_strings) {
    return false
  }

  return {
    locale: locale.replace("-", "_"),
    data: {
      "stripe_charge_succeeded_2014_subject": data.your_gift_help_us,
      "dear_name": data.dear_name ? data.dear_name.replace("%%firstname%%", "{{ name }}") : undefined,
      "first_paragraph_email": data.first_paragraph_email,
      "second_paragraph_email": data.second_paragraph_email,
      "third_paragraph_email": data.third_paragraph_email,
      "executive_director": data.executive_director,
      "here_is_record": data.here_is_record,
      "gift_amount": data.gift_amount ? data.gift_amount.replace("%%amount_formatted%%", "{{ amount }}") : undefined,
      "transaction_id": data.transaction_id ? data.transaction_id.replace("%%transaction_id%%", "{{ transaction_id }}") : undefined,
      "cancel_recurring_donation_email": data.cancel_recurring_donation_email,
      "mozilla_contribution": data.mozilla_contribution,
      "more_info_about_page": data.more_info_about_page,
      "mozilla_foundation_tax_id": data.mozilla_foundation_tax_id
    }
  };
}).filter((o) => { return !!o; }).forEach((translation) => {
  var directory_path = to + translation.locale;
  var filename = directory_path + "/stripe_charge_succeeded_2014.json";
  var file_data = JSON.stringify(translation.data, null, 2) + "\n";

  if (file_data === "{}\n") {
    return;
  }

  try {
    fs.mkdirSync(directory_path);
  } catch (mkdir_error) {
    if (mkdir_error.code !== "EEXIST") {
      throw mkdir_error;
    }
  }

  fs.writeFileSync(filename, file_data);
});


