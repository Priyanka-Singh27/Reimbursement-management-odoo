const fs = require('fs');

const files = [
  'd:/odoo/Reimbursement-management-odoo/frontend/src/app/dashboard/page.tsx',
  'd:/odoo/Reimbursement-management-odoo/frontend/src/app/dashboard/approvals/page.tsx',
  'd:/odoo/Reimbursement-management-odoo/frontend/src/app/dashboard/my-expenses/page.tsx',
  'd:/odoo/Reimbursement-management-odoo/frontend/src/app/dashboard/rules/page.tsx',
  'd:/odoo/Reimbursement-management-odoo/frontend/src/app/dashboard/submit/page.tsx',
  'd:/odoo/Reimbursement-management-odoo/frontend/src/app/dashboard/team-expenses/page.tsx',
  'd:/odoo/Reimbursement-management-odoo/frontend/src/app/dashboard/users/page.tsx'
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  // Replace the opening div
  c = c.replace(/  return \(\n    <div className="(max-w-[a-z0-9-]+ mx-auto )?space-y-[0-9]+ pb-[0-9]+">/, (match) => {
    return '  return (\n    <div className="flex-1 py-[40px] px-[48px] w-full flex flex-col min-h-0">\n  ' + match.replace('  return (\n', '');
  });
  
  // Remove fixed heights as requested
  c = c.replace(/ min-h-\[500px\]/g, '');
  
  // Replace the closing div. Since we added a wrapper, we append </div> before the final );\n}
  if (c.includes('<div className="flex-1 py-[40px] px-[48px] w-full flex flex-col min-h-0">')) {
     let lines = c.split('\n');
     for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i] && lines[i].includes(');')) {
           lines.splice(i, 0, '    </div>');
           break;
        }
     }
     c = lines.join('\n');
     fs.writeFileSync(f, c);
     console.log('Wrapped ' + f);
  } else {
     console.log('Skipped ' + f);
  }
});
