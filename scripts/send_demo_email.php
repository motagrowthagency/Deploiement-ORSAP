<?php
require_once __DIR__ . '/../public/api/mail.php';

$demoRecipient = 'gwa.mohamed.tazi@gmail.com';

$clientEntry = [
    'id' => 'DEV-2026-9842',
    'createdAt' => date('Y-m-d H:i:s'),
    'clientType' => 'professional',
    'name' => 'Fatimazahra Mountadem',
    'company' => 'EM Energie services',
    'phone' => '+212 6 68 05 99 68',
    'email' => 'F.mountadem@em-energie.com',
    'solutions' => ['TRAVAIL EN HAUTEUR'],
    'sectors' => ['FACILITY MANAGEMENT', 'INDUSTRIE'],
    'message' => 'ECHAFAUDAGE ROULANT ALUMINIUM HAUTEUR DE TRAVAIL 6 M'
];

echo "Sending demo confirmation email to: " . $demoRecipient . " ...\n";
$res = sendDevisCustomerConfirmationEmailPHP($clientEntry, $demoRecipient);
echo "Result:\n";
print_r($res);
