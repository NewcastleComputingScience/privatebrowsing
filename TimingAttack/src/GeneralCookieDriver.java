/*
 Driver application for cookie timing attack.
 Copyright (C) 2013 M. J. Forshaw (m.j.forshaw@ncl.ac.uk)
 
 If you make use of any code or concepts contained within this package,
 please cite the following paper:
 
    [Paper Information]
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import java.util.Arrays;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxProfile;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.safari.SafariDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * @author M.J. Forshaw (m.j.forshaw@ncl.ac.uk)
 * @version 1.0
 */
public class GeneralCookieDriver {
	
	// TODO: Move into configuration script / command line arguments.
	public static Browser browser = Browser.IE;
	public static int[] numberOfCookies = {150000};
	public static int numTrialsPerRun = 200;
	public static int numRunsPerExecution = 1;
	public static String chromeDriverLocation = "C:\\temp\\chromedriver.exe";
	public static String ieDriverLocation = "H:\\IEDriverServer.exe";
	public static String cookieGeneratorLocation = "http://localhost/cookies%20-%20Copy/";
	
	public static void main(String[] args) {
		
		for (int i = 0; i < numRunsPerExecution; i++)
		{
			System.out.println("[P," + browser + "]" + new GeneralCookieDriver().conductTest(browser, true, numberOfCookies, numTrialsPerRun));
			System.out.println("[N," + browser + "]" + new GeneralCookieDriver().conductTest(browser, false, numberOfCookies, numTrialsPerRun));
		}
	}
	
	public WebDriver getWebDriver(Browser browser, boolean privateBrowsing)
	{
		if (browser.equals(Browser.CHROME))
		{
			DesiredCapabilities capabilities = DesiredCapabilities.chrome();
			
			if (privateBrowsing)
			{
				capabilities.setCapability("chrome.switches", Arrays.asList("--incognito"));
			}
			
			System.setProperty("webdriver.chrome.driver",chromeDriverLocation);
			
			return new ChromeDriver(capabilities);
		}
		else if (browser.equals(Browser.FIREFOX))
		{
			FirefoxProfile ffp = new FirefoxProfile();
			
			if(privateBrowsing)
			{
				ffp.setPreference("browser.privatebrowsing.dont_prompt_on_enter", true);
				ffp.setPreference("browser.privatebrowsing.autostart", true);
			}
			
			DesiredCapabilities capabilities = DesiredCapabilities.firefox();
			capabilities.setCapability(FirefoxDriver.PROFILE, ffp);
			return new FirefoxDriver(capabilities);
		}
		else if (browser.equals(Browser.IE))
		{
			System.setProperty("webdriver.ie.driver",ieDriverLocation);
			
			DesiredCapabilities capabilities = DesiredCapabilities.internetExplorer();
			
			if (privateBrowsing)
			{
				System.err.println("Launching into browsing mode is not supported in IE.");
				return null;
			}
			
			return new InternetExplorerDriver();
		}
		else if (browser.equals(Browser.SAFARI))
		{
			if (privateBrowsing)
			{
				System.out.println("WARNING: Selenium does not support launching into Safari private browsing mode.");
				System.out.println("         You will be given 10 seconds to transition into the private browsing ");
				System.out.println("         mode before the tests begin!");
			}
			
			return new SafariDriver();
		}
		
		return null;
	}
	
	public Integer conductTest(Browser browser, boolean privateBrowsing, int[] cookies, int numTrialsPerRun)
	{
		WebDriver driver = getWebDriver(browser, privateBrowsing);
		
		if (driver == null)
		{
			System.err.println("WebDriver could not be found for " + browser + " in " + (privateBrowsing ? "private" : "normal") + " mode.");
			return 0;
		}
		
		if (browser.equals(Browser.SAFARI) && privateBrowsing)
		{
			System.err.println("Pausing for 10 seconds...");
			try {
				Thread.sleep(10000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			System.err.println("Resuming from pause...");
		}
		
		
		for (int c = 0; c < cookies.length; c++)
		{
		
			for (int i = 0; i < numTrialsPerRun; i++)
			{

				driver.get(new String(cookieGeneratorLocation + "?numCookies=" + cookies[c]
						+ "&browser=" + browser.toString() + "&mode=" + (privateBrowsing ? "private" : "normal")));

				try {
					new WebDriverWait(driver, 120).until(ExpectedConditions.titleContains("[ResultProvided]"));
					
				}
				catch (org.openqa.selenium.UnhandledAlertException e)
				{
					System.err.println("UnhandledAlertException");
					continue;
				}
				catch (Exception e)
				{
					e.printStackTrace();
					continue;
				}
				
				Integer result = new Integer(driver.getTitle().split(" ")[0]);
				

				System.out.println(browser.toString() + (privateBrowsing ? ",P," : ",N,") + cookies[c] + "," + result);
			}
		}

		//Close the browser
		driver.quit();
		
		return 0;
	}
}