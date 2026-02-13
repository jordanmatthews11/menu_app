import './HelpGuide.css';

export const HelpGuide = () => {
  return (
    <div className="help-guide">
      {/* Table of Contents */}
      <nav className="help-toc">
        <h3>Contents</h3>
        <ul>
          <li><a href="#getting-started">Getting Started</a></li>
          <li><a href="#order-submission">Order Submission</a></li>
          <li><a className="toc-sub" href="#step-1">Step 1: Select Categories</a></li>
          <li><a className="toc-sub" href="#step-2">Step 2: Configure Retailers</a></li>
          <li><a className="toc-sub" href="#step-3">Step 3: Review &amp; Submit</a></li>
          <li><a href="#review-orders">Review Submitted Orders</a></li>
          <li><a href="#store-lists">Standard Store Lists</a></li>
          <li><a href="#code-directory">Master Code Directory</a></li>
          <li><a href="#admin">Admin Panel</a></li>
          <li><a href="#tips">Tips &amp; Tricks</a></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="help-content">
        <h1>How to Use This App</h1>
        <p className="help-intro">
          This guide walks you through every feature of the Order Submission application.
          Whether you are placing a new order, reviewing past submissions, browsing store lists,
          or managing data in the Admin panel, you will find step-by-step instructions below.
        </p>

        {/* ── Getting Started ── */}
        <section className="help-section" id="getting-started">
          <h2>Getting Started</h2>
          <h3>Signing In</h3>
          <p>
            When you first open the app, you will see a <strong>Sign in with Google</strong> button.
            Click it to authenticate with your Google account. Only users with authorized accounts
            can access the application.
          </p>

          <h3>Navigation Overview</h3>
          <p>The app has four main tabs along the top of the screen:</p>
          <ol>
            <li><strong>Order Submission</strong> -- The primary workflow for creating and submitting new orders.</li>
            <li><strong>Review Submitted Orders</strong> -- View all previously submitted orders from your team.</li>
            <li><strong>Standard Store Lists</strong> -- Browse and export pre-configured retailer lists.</li>
            <li><strong>Master Code Directory</strong> -- Search all category codes (standard and custom).</li>
          </ol>

          <h3>Header Controls</h3>
          <p>In the top-right corner of the header, you will find:</p>
          <ul>
            <li>Your <strong>profile picture and name</strong></li>
            <li><strong>How to Use</strong> -- Opens this training guide (you are here!)</li>
            <li><strong>Admin</strong> -- Opens the Admin panel (authorized users only)</li>
            <li><strong>Sign Out</strong> -- Logs you out of the application</li>
          </ul>
        </section>

        {/* ── Order Submission ── */}
        <section className="help-section" id="order-submission">
          <h2>Order Submission (3-Step Flow)</h2>
          <p>
            Submitting an order is a guided 3-step process. A progress indicator in the header
            shows which step you are on. You can move forward and backward between steps at any time.
          </p>
        </section>

        {/* Step 1 */}
        <section className="help-section" id="step-1">
          <h3>Step 1: Select Categories</h3>
          <p>
            This step presents a scrollable table of all available retail categories
            (e.g., Paper Towels, Candy, Frozen Pizza). Each row shows the category name,
            department, example brands, description, collection notes, and available countries.
          </p>

          <h4>How to Select Categories</h4>
          <ol>
            <li>Browse the table or use the <strong>search bar</strong> at the top to find categories.</li>
            <li>Click the <strong>checkbox</strong> next to a category to select it.</li>
            <li>If a category is available in multiple countries (e.g., US and Canada), a
                <strong> country picker popup</strong> will appear asking you which countries you
                want to subscribe to. Check the countries you need and click <strong>Confirm</strong>.</li>
            <li>Your selection count appears above the table (e.g., "3 categories selected").</li>
            <li>Click <strong>Next: Configure Retailers</strong> to proceed to Step 2.</li>
          </ol>

          <div className="help-tip">
            <strong>Tip: Fuzzy Search</strong> -- The search bar uses fuzzy matching. For example,
            typing "HEB" will match "H-E-B" even though the hyphens are different. This works by
            stripping non-alphanumeric characters before comparing.
          </div>
        </section>

        {/* Step 2 */}
        <section className="help-section" id="step-2">
          <h3>Step 2: Configure Retailers</h3>
          <p>
            For each category and country you selected, you will configure which retailers
            to include in your order. The screen is split into two panels:
          </p>
          <ul>
            <li><strong>Left panel</strong> -- Configuration panels for each category/country combination</li>
            <li><strong>Right panel</strong> -- A live Selection Summary showing your current selections and totals</li>
          </ul>

          <h4>A. Select Standard Store Lists (Required)</h4>
          <p>
            Standard Store Lists are pre-configured groups of retailers. Check the box next to
            a list to add all its retailers to your order. Click the <strong>arrow</strong> to
            expand a list and see individual retailers and their monthly store counts.
          </p>
          <p>
            If you do not want to use a standard list, check <strong>"Proceed without standard list"</strong>.
          </p>

          <h4>B. Add Boosters (Optional)</h4>
          <p>
            Boosters let you add extra retailers beyond the standard lists, or increase
            collection at specific stores. When you add a booster, you must enter a
            <strong> monthly count</strong> -- the number of stores to collect from each month
            for that booster retailer.
          </p>

          <h4>C. Set Collection Period</h4>
          <p>
            Choose a <strong>start date</strong> and <strong>end date</strong> for data
            collection. Both dates are required.
          </p>

          <h4>D. Collection Notes</h4>
          <p>
            Optionally add any special instructions or notes about the collection.
          </p>

          <h4>Apply to All Categories</h4>
          <p>
            If you have multiple categories selected and want the same configuration for all of them,
            set up one category and click <strong>"Apply this setup to All"</strong>. This copies
            the store lists, boosters, dates, and notes to every category/country panel.
          </p>

          <h4>Selection Summary (Right Panel)</h4>
          <p>
            The summary panel shows all retailers in your current configuration, their type
            (Standard or Booster), and monthly quotas. At the bottom, you will see the total
            request including standard monthly quota, booster count, and total monthly stores.
          </p>

          <div className="help-tip">
            <strong>Tip:</strong> If the retailer list is long, look for the
            "Scroll to see all retailers" hint at the bottom of the summary table.
          </div>

          <h4>Submitting the Configuration</h4>
          <p>
            Once all categories have valid configurations (store lists or "proceed without",
            plus start/end dates), click <strong>"Submit Order"</strong> at the bottom to
            move to Step 3.
          </p>
        </section>

        {/* Step 3 */}
        <section className="help-section" id="step-3">
          <h3>Step 3: Review &amp; Submit</h3>
          <p>
            This step shows a complete table of all order entries you have created. Review
            the details carefully before submitting.
          </p>

          <h4>Table Columns</h4>
          <p>
            Category, Country, Retailer, Type (Standard/Booster), Store List, Monthly quota,
            Start Date, End Date, and Notes.
          </p>

          <h4>Actions</h4>
          <ul>
            <li>
              <strong>+ Add More Categories</strong> -- Takes you back to Step 1 to select
              additional categories. Your existing entries are preserved.
            </li>
            <li>
              <strong>Submit Order</strong> -- Submits the order to the system. You will see a
              confirmation dialog. Once confirmed, the order is saved and your local entries
              are cleared.
            </li>
            <li>
              <strong>Clear All</strong> -- Removes all entries without submitting. You will
              be asked to confirm.
            </li>
          </ul>

          <div className="help-tip">
            <strong>Tip:</strong> Your order entries are automatically saved in your browser.
            If you close the tab and come back later, your entries will still be there on Step 3
            until you submit or clear them.
          </div>
        </section>

        {/* ── Review Submitted Orders ── */}
        <section className="help-section" id="review-orders">
          <h2>Review Submitted Orders</h2>
          <p>
            This tab shows all orders that have been formally submitted by your team.
            Each order appears as a card showing:
          </p>
          <ul>
            <li>The <strong>submitter name</strong> and submission date/time</li>
            <li>A <strong>category rollup</strong> summary -- for each category/country in the order,
                you will see the number of standard retailers, boosters, and total monthly visits</li>
            <li>A <strong>Submitted</strong> status badge</li>
          </ul>

          <h3>Viewing Order Details</h3>
          <p>
            Click on any order card to expand it and see the full table of entries (same columns
            as Step 3). Click again to collapse it.
          </p>

          <h3>Searching Orders</h3>
          <p>
            Use the search bar to filter orders by submitter name, email, category, retailer,
            or country.
          </p>

          <h3>Deleting Orders</h3>
          <p>
            Only <strong>authorized admin users</strong> can delete submitted orders. If you are
            authorized, you will see an "X" button on each order card. Deleting an order is
            permanent and cannot be undone.
          </p>
        </section>

        {/* ── Standard Store Lists ── */}
        <section className="help-section" id="store-lists">
          <h2>Standard Store Lists</h2>
          <p>
            This tab lets you browse all pre-configured standard store lists and see which
            retailers belong to each one.
          </p>

          <h3>Browsing and Filtering</h3>
          <ul>
            <li>Use the <strong>search bar</strong> to find lists by name or retailer.</li>
            <li>Use the <strong>country dropdown</strong> to filter lists by country.</li>
            <li>Lists are displayed as cards in a 4-column grid. Scroll down to see all lists.</li>
          </ul>

          <h3>Viewing List Details</h3>
          <p>
            Each card shows the list name, country, and number of retailers. Click the
            expand arrow to see the full retailer table with monthly quotas and a totals row.
          </p>

          <h3>Exporting to Excel</h3>
          <ol>
            <li>Check the <strong>checkbox</strong> on each list you want to export (or use
                <strong> Select All</strong> to select everything visible).</li>
            <li>Click the green <strong>Export to Excel</strong> button.</li>
            <li>An <span className="help-kbd">.xlsx</span> file will download with one sheet per
                selected list, containing all retailers, monthly quotas, and a totals row.</li>
          </ol>
        </section>

        {/* ── Master Code Directory ── */}
        <section className="help-section" id="code-directory">
          <h2>Master Code Directory</h2>
          <p>
            The Master Code Directory combines all codes from two sources into a single
            searchable table:
          </p>
          <ul>
            <li><strong>Standard codes</strong> -- Codes tied to categories (shown with a green "Standard" tag)</li>
            <li><strong>Custom codes</strong> -- Standalone codes not tied to any category (shown with an orange "Custom" tag)</li>
          </ul>

          <h3>Searching and Filtering</h3>
          <p>
            Use the search bar to search across all fields (category, code, type, country,
            department, customer). Use the country dropdown to filter by a specific country.
          </p>

          <h3>Identifying Duplicate Codes</h3>
          <ol>
            <li>Click the <strong>"Identify Duplicate Codes"</strong> button.</li>
            <li>A modal will appear showing all codes that appear more than once.</li>
            <li>Check <strong>"Ignore entries that are unique per country"</strong> to filter
                out codes that are only duplicated because they exist in different countries
                (this is often expected and acceptable).</li>
            <li>Review the duplicate groups to identify any unintended overlaps.</li>
          </ol>

          <h3>Exporting</h3>
          <p>
            Click <strong>Export CSV</strong> to download the currently filtered table as a
            <span className="help-kbd">.csv</span> file.
          </p>
        </section>

        {/* ── Admin Panel ── */}
        <section className="help-section" id="admin">
          <h2>Admin Panel</h2>
          <p>
            The Admin panel is accessible via the <strong>Admin</strong> button in the top-right
            header. Only <strong>authorized users</strong> (those whose email appears in the
            Authorized Users list) can access the Admin panel. Other users will see an
            "Access Denied" message.
          </p>

          <h3>Admin Tabs</h3>
          <p>The Admin panel has five tabs, each managing a different data collection:</p>

          <h4>1. Categories</h4>
          <p>
            View, add, edit, and delete retail categories. Each category has a name, code,
            department, example brands, description, collection notes, and country.
          </p>

          <h4>2. Standard Store Lists</h4>
          <p>
            Manage pre-configured retailer lists. Each list has a name, country, and a set of
            retailers with monthly quotas. You can add/edit/delete individual retailers within
            a list, or delete entire lists.
          </p>

          <h4>3. Boosters</h4>
          <p>
            Manage the list of available booster retailers that users can add to their orders.
          </p>

          <h4>4. Custom Category Codes</h4>
          <p>
            Manage custom codes that are not tied to any standard category. These appear in the
            Master Code Directory with a "Custom" tag.
          </p>

          <h4>5. Authorized Users</h4>
          <p>
            Manage which users have admin access. Add users by name and email address. Only
            users in this list can access the Admin panel and delete submitted orders.
          </p>

          <h3>Exporting Data</h3>
          <p>
            Every admin table has an <strong>Export CSV</strong> button that downloads the
            current table contents as a CSV file.
          </p>

          <h3>Seeding Data</h3>
          <p>
            The Admin panel includes options to seed initial data from CSV files into the
            database. Use <strong>Seed from CSVs</strong> to populate empty collections, or
            <strong> Force Re-seed</strong> to reload data (note: this may create duplicates
            if data already exists).
          </p>
        </section>

        {/* ── Tips & Tricks ── */}
        <section className="help-section" id="tips">
          <h2>Tips &amp; Tricks</h2>

          <h3>Fuzzy Search</h3>
          <p>
            The category search bar strips punctuation and special characters before matching.
            This means searching "HEB" will find "H-E-B", and "OReillys" will find "O'Reilly's".
          </p>

          <h3>Multi-Country Categories</h3>
          <p>
            When a category is available in multiple countries, selecting it opens a popup
            where you choose which countries to include. You do not have to subscribe to every
            country -- pick only the ones relevant to your needs.
          </p>

          <h3>Order Persistence</h3>
          <p>
            Your draft order entries (before submission) are stored in your browser's local
            storage. This means you can close the browser, come back later, and your draft
            will still be waiting on Step 3. Once you click "Submit Order", the entries are
            sent to the database and cleared from local storage.
          </p>

          <h3>Booster Monthly Count</h3>
          <p>
            When adding a booster retailer, you must enter a monthly store count. This tells
            the system how many stores to collect from each month for that booster. Set this
            to 0 if you have not determined the count yet.
          </p>

          <h3>Apply to All</h3>
          <p>
            In Step 2 (Configure Retailers), if you are subscribing to multiple categories with
            the same retailer setup, configure the first one and click "Apply this setup to All"
            to copy store lists, boosters, dates, and notes to every other category.
          </p>

          <h3>Excel Export for Store Lists</h3>
          <p>
            On the Standard Store Lists tab, you can select multiple lists and export them all
            at once to a single Excel file. Each list gets its own sheet tab in the workbook.
          </p>
        </section>
      </div>
    </div>
  );
};
